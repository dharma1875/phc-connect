import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import { SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { serviceService } from '../services/serviceService';
import {
  FileText,
  RotateCcw,
  PlusCircle,
  Calendar,
  Stethoscope,
} from 'lucide-react';

export default function ServiceHistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await serviceService.getMyReports();
      setReports(data?.reports || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load service history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <DashboardLayout
      pageTitle="Submitted Healthcare Services History"
      subtitle="Historical log of all daily patient and clinical metrics submitted by your account"
      headerRight={
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => navigate('/doctor/services')}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Submit Today's Report</span>
          </button>
          <button
            type="button"
            onClick={fetchReports}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchReports} />}

      <div className="card-base" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <FileText size={20} color="#0284c7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Service Activity Records ({reports.length})
          </h3>
        </div>

        {loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No Service Reports Submitted Yet"
            description="You have not submitted any daily healthcare activity logs yet."
            actionLabel="Submit First Report"
            onAction={() => navigate('/doctor/services')}
          />
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Service Date</th>
                  <th>Service Category</th>
                  <th>Count / Tally</th>
                  <th>Status</th>
                  <th>Facility</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr key={report.id || `${report.service_date}-${idx}`}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {report.service_date}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {report.service_type_name || 'Healthcare Service'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7', fontSize: '1.05rem' }}>
                        {report.value}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status="SUBMITTED" size="small" />
                    </td>
                    <td>{report.facility_name || 'Assigned Health Centre'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
