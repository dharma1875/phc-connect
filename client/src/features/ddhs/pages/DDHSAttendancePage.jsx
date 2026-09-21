import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import StatCard from '../../../components/common/StatCard';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { ddhsService } from '../services/ddhsService';
import {
  UserCheck,
  Clock,
  XCircle,
  Calendar,
  Filter,
  RotateCcw,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function DDHSAttendancePage() {
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await ddhsService.getDistricts();
        setDistricts(data || []);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load districts.');
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchTaluks = async () => {
      if (!selectedDistrict) {
        setTaluks([]);
        setSelectedTaluk('');
        return;
      }
      try {
        const data = await ddhsService.getTaluksByDistrict(selectedDistrict);
        setTaluks(data || []);
        setSelectedTaluk('');
      } catch (loadError) {
        setError(loadError.message || 'Unable to load taluks.');
      }
    };
    fetchTaluks();
  }, [selectedDistrict]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      const [summaryData, attendanceData] = await Promise.all([
        ddhsService.getAttendanceSummary({
          districtId: selectedDistrict,
          talukId: selectedTaluk,
          facilityId,
          facilityType,
          date,
          status,
        }),
        ddhsService.getAttendance({
          districtId: selectedDistrict,
          talukId: selectedTaluk,
          facilityId,
          facilityType,
          date,
          status,
        }),
      ]);
      setSummary(summaryData || {});
      setAttendance(attendanceData?.attendance || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDistrict, selectedTaluk, facilityId, facilityType, date, status]);

  const handleReset = () => {
    setSelectedDistrict('');
    setSelectedTaluk('');
    setFacilityType('');
    setFacilityId('');
    setStatus('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <DashboardLayout
      pageTitle="Doctor Attendance Monitoring"
      subtitle={`Live shift verification and check-in audit &bull; Date: ${date}`}
      headerRight={
        <button
          type="button"
          onClick={fetchAttendanceData}
          className="btn btn-secondary btn-sm"
        >
          <RotateCcw size={14} />
          <span>Refresh</span>
        </button>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchAttendanceData} />}

      {/* KPI SUMMARY METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatCard
          title="Present"
          value={summary?.present ?? 0}
          subtitle="Checked in on time"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Late Check-in"
          value={summary?.late ?? 0}
          subtitle="Arrived after cutoff"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          title="Absent"
          value={summary?.absent ?? 0}
          subtitle="Alert triggered"
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          title="On Leave"
          value={summary?.leave ?? 0}
          subtitle="Approved leave"
          icon={Calendar}
          tone="neutral"
        />
        <StatCard
          title="Pending Update"
          value={summary?.notMarked ?? 0}
          subtitle="Awaiting shift log"
          icon={Users}
          tone="primary"
        />
      </div>

      {/* FILTER BAR CARD */}
      <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Filter size={18} color="#0284c7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Filter Attendance Records
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Date Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-control"
            />
          </div>

          {/* District Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-control"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Taluk Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Taluk
            </label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              disabled={!selectedDistrict}
              className="input-control"
            >
              <option value="">{selectedDistrict ? 'All Taluks' : 'Select District First'}</option>
              {taluks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="input-control"
            >
              <option value="">All Types</option>
              <option value="PHC">PHC</option>
              <option value="UPHC">UPHC</option>
              <option value="HSC">HSC</option>
            </select>
          </div>

          {/* Attendance Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-control"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="ABSENT">ABSENT</option>
              <option value="LEAVE">LEAVE</option>
              <option value="NOT_MARKED">NOT MARKED</option>
            </select>
          </div>
        </div>

        {(selectedDistrict || selectedTaluk || facilityType || status || date !== new Date().toISOString().slice(0, 10)) && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ATTENDANCE RECORDS TABLE */}
      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : attendance.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Attendance Records Found"
          description="No attendance entries were found for the selected date and filters."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Medical Officer</th>
                <th>Facility</th>
                <th>Type</th>
                <th>Taluk</th>
                <th>Status</th>
                <th>Check-in Time</th>
                <th>Check-out Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((entry, index) => (
                <tr key={entry.id || `${entry.doctor_name}-${index}`}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{entry.doctor_name}</div>
                    {entry.doctor_code && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {entry.doctor_code}
                      </div>
                    )}
                  </td>
                  <td>{entry.facility_name}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          entry.facility_type === 'PHC'
                            ? '#0284c7'
                            : entry.facility_type === 'UPHC'
                            ? '#0d9488'
                            : '#6366f1',
                        backgroundColor:
                          entry.facility_type === 'PHC'
                            ? '#e0f2fe'
                            : entry.facility_type === 'UPHC'
                            ? '#ccfbf1'
                            : '#e0e7ff',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {entry.facility_type}
                    </span>
                  </td>
                  <td>{entry.taluk_name || '—'}</td>
                  <td>
                    <StatusBadge status={entry.status} size="small" />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                      <Clock size={13} color="#64748b" />
                      <span>{entry.check_in_time || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                      <Clock size={13} color="#64748b" />
                      <span>{entry.check_out_time || '—'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
