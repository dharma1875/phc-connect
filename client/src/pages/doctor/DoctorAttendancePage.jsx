import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorCard from '../../components/common/ErrorCard';
import { useToast } from '../../context/ToastContext';
import { doctorService } from '../../services/doctorService';
import {
  UserCheck,
  Clock,
  Calendar,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react';

export default function DoctorAttendancePage() {
  const { showToast } = useToast();

  const [attendance, setAttendance] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    checkedOut: 0,
    missing: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refreshAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const [todayData, summaryData, historyData] = await Promise.all([
        doctorService.getTodayAttendance(),
        doctorService.getAttendanceSummary(),
        doctorService.getAttendanceHistory(),
      ]);

      setAttendance(todayData?.attendance || null);
      setSummary(
        summaryData?.summary || {
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          checkedOut: 0,
          missing: 0,
        }
      );
      setHistory(historyData?.attendance || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAttendance();
  }, []);

  const handleMarkAttendance = async () => {
    try {
      setSubmitting(true);
      const response = await doctorService.markAttendance();
      setAttendance(response?.attendance || null);
      showToast('Attendance successfully recorded! Check-in time logged.', 'success');
      await refreshAttendance();
    } catch (markError) {
      showToast(markError.message || 'Unable to mark attendance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      const response = await doctorService.checkOutAttendance();
      setAttendance((prev) => ({
        ...(prev || {}),
        check_out_time: response?.attendance?.checkOutTime || null,
      }));
      showToast('Check-out recorded successfully.', 'success');
      await refreshAttendance();
    } catch (checkOutError) {
      showToast(checkOutError.message || 'Unable to mark check-out.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = attendance?.status || 'NOT_MARKED';
  const hasCheckIn = Boolean(attendance?.check_in_time);
  const hasCheckOut = Boolean(attendance?.check_out_time);

  return (
    <DashboardLayout
      pageTitle="Attendance &amp; Duty Logs"
      subtitle="Record daily duty shifts, track arrival cutoff compliance, and review historical logs"
      headerRight={
        <button
          type="button"
          onClick={refreshAttendance}
          className="btn btn-secondary btn-sm"
        >
          <RotateCcw size={14} />
          <span>Refresh</span>
        </button>
      }
    >
      {error && <ErrorCard message={error} onRetry={refreshAttendance} />}

      {/* TODAY'S ATTENDANCE STATUS CARD */}
      <div
        className="card-base"
        style={{
          padding: '1.75rem',
          marginBottom: '1.75rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Today's Shift Status
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Official Cutoff: 10:00 AM &bull; Automated absence checks run daily
              </div>
            </div>
          </div>

          <StatusBadge status={statusLabel} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
              Attendance Date
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
              Check-in Timestamp
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hasCheckIn ? '#15803d' : '#94a3b8', marginTop: '3px' }}>
              {attendance?.check_in_time || 'Not checked in'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
              Check-out Timestamp
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hasCheckOut ? '#0284c7' : '#94a3b8', marginTop: '3px' }}>
              {attendance?.check_out_time || 'Not checked out'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
          {!hasCheckIn ? (
            <button
              type="button"
              onClick={handleMarkAttendance}
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ gap: '8px' }}
            >
              <UserCheck size={20} />
              <span>{submitting ? 'Recording...' : 'Mark Present (Check-In)'}</span>
            </button>
          ) : !hasCheckOut ? (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={submitting}
              className="btn btn-secondary btn-lg"
              style={{ gap: '8px', borderColor: '#0284c7', color: '#0284c7' }}
            >
              <Clock size={20} />
              <span>{submitting ? 'Recording...' : 'Record Shift Check-Out'}</span>
            </button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              <span>Duty completed and checked out for today.</span>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatCard
          title="Total Shifts"
          value={summary.total ?? 0}
          subtitle="Duty records"
          icon={Calendar}
          tone="primary"
        />
        <StatCard
          title="Present On-Time"
          value={summary.present ?? 0}
          subtitle="Compliant check-ins"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Late Shifts"
          value={summary.late ?? 0}
          subtitle="After cutoff"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          title="Absences"
          value={summary.absent ?? 0}
          subtitle="Unexcused / alert"
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          title="Full Check-Outs"
          value={summary.checkedOut ?? 0}
          subtitle="Completed shifts"
          icon={UserCheck}
          tone="teal"
        />
      </div>

      {/* HISTORICAL ATTENDANCE LOGS TABLE */}
      <div className="card-base" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <History size={20} color="#0284c7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Attendance History ({history.length})
          </h3>
        </div>

        {loading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : history.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Past Attendance Records"
            description="You have not yet accumulated past attendance records on this profile."
          />
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Duty Date</th>
                  <th>Facility</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                  <th>Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={record.id || index}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {record.attendance_date || record.date}
                    </td>
                    <td>{record.facility_name || 'Assigned PHC'}</td>
                    <td>
                      <StatusBadge status={record.status} size="small" />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#64748b" />
                        <span>{record.check_in_time || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#64748b" />
                        <span>{record.check_out_time || '—'}</span>
                      </div>
                    </td>
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
