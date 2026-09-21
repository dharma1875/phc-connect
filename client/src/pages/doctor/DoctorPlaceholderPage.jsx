import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { Clock } from 'lucide-react';

export default function DoctorPlaceholderPage({
  title = 'Section In Progress',
  message = 'This module is scheduled for development in an upcoming administrative phase.',
}) {
  return (
    <DashboardLayout pageTitle={title}>
      <EmptyState
        icon={Clock}
        title={title}
        description={message}
      />
    </DashboardLayout>
  );
}
