import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorFacilityPage from './pages/doctor/DoctorFacilityPage';
import DoctorAttendancePage from './pages/doctor/DoctorAttendancePage';
import HealthcareServicesPage from './features/services/pages/HealthcareServicesPage';
import ServiceHistoryPage from './features/services/pages/ServiceHistoryPage';
import DDHSDashboardPage from './features/ddhs/pages/DDHSDashboardPage';
import DDHSFacilitiesPage from './features/ddhs/pages/DDHSFacilitiesPage';
import DDHSFacilityDetailsPage from './features/ddhs/pages/DDHSFacilityDetailsPage';
import DDHSAttendancePage from './features/ddhs/pages/DDHSAttendancePage';
import DDHSServicesPage from './features/ddhs/pages/DDHSServicesPage';
import DDHSAlertsPage from './features/alerts/pages/DDHSAlertsPage';
import DDHSReportsPage from './features/reports/pages/DDHSReportsPage';
import DoctorPlaceholderPage from './pages/doctor/DoctorPlaceholderPage';
import ProtectedRoute from './routes/ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'DDHS' ? '/ddhs/dashboard' : '/doctor/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/ddhs/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/facilities"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSFacilitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/facility/:facilityId"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSFacilityDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/attendance"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/services"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/alerts"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSAlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/reports"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddhs/reports/facilities"
        element={
          <ProtectedRoute allowedRoles={['DDHS']}>
            <DDHSReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/facility"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorFacilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/attendance"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/services"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <HealthcareServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/services/history"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <ServiceHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/reports"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPlaceholderPage title="Reports" message="Reports will be available in a future phase." />
          </ProtectedRoute>
        }
      />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route
        path="/"
        element={
          <Navigate
            to={user ? (user.role === 'DDHS' ? '/ddhs/dashboard' : '/doctor/dashboard') : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
