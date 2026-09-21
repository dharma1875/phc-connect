import { CheckCircle2, Clock, XCircle, AlertTriangle, Check, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function StatusBadge({ status, size = 'normal', showIcon = true }) {
  const norm = String(status || '').toUpperCase().trim();

  let config = {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    label: status || 'Unknown',
    icon: <Info size={13} />,
  };

  if (norm === 'PRESENT') {
    config = {
      bg: '#dcfce7',
      color: '#15803d',
      border: '#bbf7d0',
      label: 'Present',
      icon: <CheckCircle2 size={13} />,
    };
  } else if (norm === 'LATE') {
    config = {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      label: 'Late',
      icon: <Clock size={13} />,
    };
  } else if (norm === 'ABSENT') {
    config = {
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fecaca',
      label: 'Absent',
      icon: <XCircle size={13} />,
    };
  } else if (norm === 'LEAVE') {
    config = {
      bg: '#f3e8ff',
      color: '#7e22ce',
      border: '#e9d5ff',
      label: 'On Leave',
      icon: <Info size={13} />,
    };
  } else if (norm === 'NOT_MARKED') {
    config = {
      bg: '#f1f5f9',
      color: '#64748b',
      border: '#cbd5e1',
      label: 'Not Marked',
      icon: <Clock size={13} />,
    };
  } else if (norm === 'HIGH' || norm === 'CRITICAL') {
    config = {
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fecaca',
      label: norm === 'CRITICAL' ? 'Critical' : 'High Severity',
      icon: <ShieldAlert size={13} />,
    };
  } else if (norm === 'MEDIUM' || norm === 'WARNING' || norm === 'NEEDS ATTENTION') {
    config = {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      label: norm === 'NEEDS ATTENTION' ? 'Needs Attention' : norm === 'MEDIUM' ? 'Medium' : 'Warning',
      icon: <AlertTriangle size={13} />,
    };
  } else if (norm === 'LOW') {
    config = {
      bg: '#e0f2fe',
      color: '#0369a1',
      border: '#bae6fd',
      label: 'Low',
      icon: <Info size={13} />,
    };
  } else if (norm === 'OPEN') {
    config = {
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fecaca',
      label: 'Open Alert',
      icon: <AlertTriangle size={13} />,
    };
  } else if (norm === 'ACKNOWLEDGED') {
    config = {
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe',
      label: 'Acknowledged',
      icon: <Check size={13} />,
    };
  } else if (norm === 'RESOLVED' || norm === 'OPERATIONAL' || norm === 'ACTIVE') {
    config = {
      bg: '#dcfce7',
      color: '#15803d',
      border: '#bbf7d0',
      label: norm === 'OPERATIONAL' ? 'Operational' : norm === 'ACTIVE' ? 'Active' : 'Resolved',
      icon: <CheckCircle size={13} />,
    };
  } else if (norm === 'SUBMITTED') {
    config = {
      bg: '#dcfce7',
      color: '#15803d',
      border: '#bbf7d0',
      label: 'Submitted',
      icon: <CheckCircle2 size={13} />,
    };
  } else if (norm === 'NOT_SUBMITTED') {
    config = {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      label: 'Pending Submission',
      icon: <Clock size={13} />,
    };
  }

  const isSmall = size === 'small';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '3px' : '5px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '9999px',
        padding: isSmall ? '0.2rem 0.55rem' : '0.3rem 0.75rem',
        fontSize: isSmall ? '0.75rem' : '0.825rem',
        fontWeight: 700,
        letterSpacing: '0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
