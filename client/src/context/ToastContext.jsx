import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          borderLeftColor: '#16a34a',
          color: '#14532d',
          icon: <CheckCircle2 size={20} color="#16a34a" />,
          bg: '#f0fdf4',
        };
      case 'warning':
        return {
          borderLeftColor: '#d97706',
          color: '#78350f',
          icon: <AlertTriangle size={20} color="#d97706" />,
          bg: '#fffbeb',
        };
      case 'error':
        return {
          borderLeftColor: '#dc2626',
          color: '#7f1d1d',
          icon: <XCircle size={20} color="#dc2626" />,
          bg: '#fef2f2',
        };
      default:
        return {
          borderLeftColor: '#0284c7',
          color: '#0c4a6e',
          icon: <Info size={20} color="#0284c7" />,
          bg: '#f0f9ff',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              className="toast-item"
              style={{
                borderLeftColor: style.borderLeftColor,
                backgroundColor: style.bg,
                color: style.color,
              }}
            >
              {style.icon}
              <div style={{ flex: 1 }}>{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: style.color,
                  display: 'flex',
                  padding: '2px',
                  opacity: 0.7,
                }}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg) => console.log(msg) };
  }
  return context;
}
