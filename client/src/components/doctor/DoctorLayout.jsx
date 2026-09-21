import DashboardLayout from '../../layouts/DashboardLayout';

export default function DoctorLayout({ children, pageTitle, subtitle, headerRight }) {
  return (
    <DashboardLayout pageTitle={pageTitle} subtitle={subtitle} headerRight={headerRight}>
      {children}
    </DashboardLayout>
  );
}
