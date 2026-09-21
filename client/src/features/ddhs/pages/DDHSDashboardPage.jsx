import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { DonutChart, ProgressBarGroup } from '../../../components/common/Charts';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import ErrorCard from '../../../components/common/ErrorCard';
import EmptyState from '../../../components/common/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { ddhsService } from '../services/ddhsService';
import { alertService } from '../../alerts/services/alertService';
import {
  Building2,
  UserCheck,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Stethoscope,
  Clock,
  Calendar,
  Eye,
  CheckCircle2,
  FileText,
  Hospital,
  ChevronRight,
  ShieldAlert,
  Search,
  Check,
  X,
} from 'lucide-react';

export default function DDHSDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal for alert resolution
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashboardData, facilitiesData, alertsData] = await Promise.all([
        ddhsService.getDashboard(),
        ddhsService.getFacilities(),
        alertService.getAlerts({ status: 'OPEN' }),
      ]);

      setSummary(dashboardData);
      setFacilities(facilitiesData?.facilities || []);
      setActiveAlerts(alertsData?.alerts || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load DDHS dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format today's date in Indian locale: e.g. Friday, 18 September 2026
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Metrics calculation from real database response
  const phcCount = summary?.facilities?.phc || 0;
  const uphcCount = summary?.facilities?.uphc || 0;
  const hscCount = summary?.facilities?.hsc || 0;
  const totalFacilities = phcCount + uphcCount + hscCount;

  const totalDoctors = summary?.doctors || 0;
  const presentCount = summary?.attendance?.present || 0;
  const lateCount = summary?.attendance?.late || 0;
  const absentCount = summary?.attendance?.absent || 0;
  const leaveCount = summary?.attendance?.leave || 0;
  const notMarkedCount = summary?.attendance?.notMarked || 0;

  const attendancePercentage =
    totalDoctors > 0 ? Math.round((presentCount / totalDoctors) * 100) : 0;

  const servicesToday = summary?.services?.submittedToday || 0;
  const openAlerts = summary?.alerts?.open || 0;
  const highSeverityAlerts = summary?.alerts?.highSeverity || 0;

  // Donut chart dataset for Facility Types
  const facilityChartData = [
    { label: 'PHC', value: phcCount, color: '#0284c7' },
    { label: 'UPHC', value: uphcCount, color: '#0d9488' },
    { label: 'HSC', value: hscCount, color: '#6366f1' },
  ];

  // Attendance breakdown progress items
  const attendanceProgressData = [
    { label: 'Present', value: presentCount, color: '#16a34a' },
    { label: 'Late', value: lateCount, color: '#d97706' },
    { label: 'Absent', value: absentCount, color: '#dc2626' },
    { label: 'On Leave', value: leaveCount, color: '#8b5cf6' },
    { label: 'Pending Update', value: notMarkedCount, color: '#94a3b8' },
  ];

  // Handle alert acknowledge
  const handleAcknowledge = async (alertId) => {
    try {
      await alertService.acknowledge(alertId);
      showToast('Alert acknowledged successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to acknowledge alert.', 'error');
    }
  };

  // Handle alert resolve
  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      setResolving(true);
      await alertService.resolve(selectedAlert.id, resolveNote);
      showToast('Alert resolved successfully.', 'success');
      setSelectedAlert(null);
      setResolveNote('');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to resolve alert.', 'error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="DDHS Monitoring Dashboard"
      subtitle={`Real-time monitoring of PHCs, UPHCs and Sub-Centres &bull; ${todayFormatted}`}
      headerRight={
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => navigate('/ddhs/facilities')}
            className="btn btn-secondary btn-sm"
          >
            <Building2 size={16} />
            <span>All Facilities</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/ddhs/reports')}
            className="btn btn-primary btn-sm"
          >
            <FileText size={16} />
            <span>Generate Reports</span>
          </button>
        </div>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchDashboardData} />}

      {loading ? (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonTable rows={4} columns={5} />
        </div>
      ) : (
        <>
          {/* SECTION 1: 4 PRIMARY KPI SUMMARY CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <StatCard
              title="Total Facilities"
              value={totalFacilities}
              subtitle={`${phcCount} PHC &bull; ${uphcCount} UPHC &bull; ${hscCount} HSC`}
              icon={Building2}
              tone="primary"
              onClick={() => navigate('/ddhs/facilities')}
            />
            <StatCard
              title="Doctors Present"
              value={`${presentCount} / ${totalDoctors}`}
              subtitle={`${attendancePercentage}% Attendance Rate`}
              icon={UserCheck}
              tone="success"
              onClick={() => navigate('/ddhs/attendance')}
            />
            <StatCard
              title="Services Today"
              value={servicesToday}
              subtitle="Daily reports submitted"
              icon={Activity}
              tone="teal"
              onClick={() => navigate('/ddhs/services')}
            />
            <StatCard
              title="Active Alerts"
              value={openAlerts}
              subtitle={
                highSeverityAlerts > 0
                  ? `${highSeverityAlerts} High Severity &bull; Requires action`
                  : 'Monitoring active'
              }
              icon={AlertTriangle}
              tone={highSeverityAlerts > 0 ? 'danger' : 'warning'}
              onClick={() => navigate('/ddhs/alerts')}
            />
          </div>

          {/* SECTION 2: FACILITY OVERVIEW & ATTENDANCE ANALYTICS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Facility Type Distribution Card */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Facility Type Overview
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Click a facility category to filter facilities
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {totalFacilities} Total
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  onClick={() => navigate('/ddhs/facilities?facilityType=PHC')}
                  style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="card-hover"
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>PHC</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0284c7' }}>{phcCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Primary Centres</div>
                </div>

                <div
                  onClick={() => navigate('/ddhs/facilities?facilityType=UPHC')}
                  style={{
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="card-hover"
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e' }}>UPHC</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0d9488' }}>{uphcCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Urban Centres</div>
                </div>

                <div
                  onClick={() => navigate('/ddhs/facilities?facilityType=HSC')}
                  style={{
                    backgroundColor: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="card-hover"
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca' }}>HSC</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#4f46e5' }}>{hscCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sub-Centres</div>
                </div>
              </div>

              <DonutChart
                data={facilityChartData}
                centerTitle="Facilities"
                centerValue={totalFacilities}
                size={160}
                onSegmentClick={(item) => navigate(`/ddhs/facilities?facilityType=${item.label}`)}
              />
            </div>

            {/* Attendance Analytics Card */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Attendance Analytics (Today)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Live status distribution across all registered medical officers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/ddhs/attendance')}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>Detailed Logs</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Attendance Quick Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803d' }}>Present</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{presentCount}</div>
                </div>
                <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#b45309' }}>Late</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{lateCount}</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#b91c1c' }}>Absent</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{absentCount}</div>
                </div>
              </div>

              <ProgressBarGroup items={attendanceProgressData} />
            </div>
          </div>

          {/* SECTION 3: ABSENTEEISM ALERT CENTER (PROMINENT) */}
          <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Absenteeism Alerts Center
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Active unacknowledged & open exceptions requiring DDHS administrative review
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/ddhs/alerts')}
                className="btn btn-secondary btn-sm"
              >
                <span>View All Alerts ({openAlerts})</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All Clear — No Active Absenteeism Alerts"
                description="All scheduled medical officers are either present or verified for today's shifts."
              />
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Facility</th>
                      <th>Taluk</th>
                      <th>Alert Date</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAlerts.slice(0, 5).map((alert) => (
                      <tr key={alert.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {alert.doctor_name || 'Medical Officer'}
                        </td>
                        <td>
                          <div>{alert.facility_name}</div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              backgroundColor: '#e0f2fe',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {alert.facility_type}
                          </span>
                        </td>
                        <td>{alert.taluk_name || 'N/A'}</td>
                        <td>{alert.alert_date}</td>
                        <td>
                          <StatusBadge status={alert.severity} size="small" />
                        </td>
                        <td>
                          <StatusBadge status={alert.status} size="small" />
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '0.825rem', color: '#475569' }}>
                          {alert.message}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={alert.status !== 'OPEN'}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                cursor: alert.status === 'OPEN' ? 'pointer' : 'not-allowed',
                                opacity: alert.status === 'OPEN' ? 1 : 0.5,
                              }}
                            >
                              Acknowledge
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedAlert(alert)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              Resolve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 4: FACILITY MONITORING TABLE (LIVE STATUS) */}
          <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Facility Operational Monitoring
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Operational readiness and doctor staffing across district centers
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/ddhs/facilities')}
                className="btn btn-secondary btn-sm"
              >
                <span>View Full Facilities Directory</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {facilities.length === 0 ? (
              <EmptyState title="No facilities found" />
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Facility Name</th>
                      <th>Type</th>
                      <th>Taluk</th>
                      <th>District</th>
                      <th>Doctors Assigned</th>
                      <th>Operational Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.slice(0, 6).map((fac) => (
                      <tr key={fac.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{fac.name}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color:
                                fac.facility_type === 'PHC'
                                  ? '#0284c7'
                                  : fac.facility_type === 'UPHC'
                                  ? '#0d9488'
                                  : '#6366f1',
                              backgroundColor:
                                fac.facility_type === 'PHC'
                                  ? '#e0f2fe'
                                  : fac.facility_type === 'UPHC'
                                  ? '#ccfbf1'
                                  : '#e0e7ff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {fac.facility_type}
                          </span>
                        </td>
                        <td>{fac.taluk_name || '—'}</td>
                        <td>{fac.district_name || 'Tamil Nadu'}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#334155' }}>
                            {fac.doctor_count || 0}
                          </span>{' '}
                          Doctors
                        </td>
                        <td>
                          <StatusBadge
                            status={fac.status === 'ACTIVE' ? 'OPERATIONAL' : fac.status}
                            size="small"
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/ddhs/facility/${fac.id}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px' }}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 5: QUICK ACTIONS CARDS */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Administrative Quick Actions
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                {
                  title: 'Facility Directory',
                  desc: 'Search, filter and inspect all health centres',
                  path: '/ddhs/facilities',
                  icon: Building2,
                  color: '#0284c7',
                },
                {
                  title: 'Attendance Monitoring',
                  desc: 'Check live daily doctor check-in records',
                  path: '/ddhs/attendance',
                  icon: UserCheck,
                  color: '#16a34a',
                },
                {
                  title: 'Healthcare Services',
                  desc: 'Review OPD, ANC, PNC & lab statistics',
                  path: '/ddhs/services',
                  icon: Activity,
                  color: '#0d9488',
                },
                {
                  title: 'Alert Resolution',
                  desc: 'Review absenteeism exceptions & audit',
                  path: '/ddhs/alerts',
                  icon: AlertTriangle,
                  color: '#dc2626',
                },
                {
                  title: 'Performance Reports',
                  desc: 'Export monthly metrics and CSV datasets',
                  path: '/ddhs/reports',
                  icon: FileText,
                  color: '#4f46e5',
                },
              ].map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(action.path)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: `${action.color}15`,
                          color: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ActionIcon size={18} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                        {action.title}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {action.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RESOLVE ALERT MODAL */}
          {selectedAlert && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(3px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setSelectedAlert(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '2rem',
                  boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={22} color="#dc2626" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      Resolve Absenteeism Alert
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  <div><strong>Doctor:</strong> {selectedAlert.doctor_name || 'N/A'}</div>
                  <div><strong>Facility:</strong> {selectedAlert.facility_name} ({selectedAlert.facility_type})</div>
                  <div><strong>Date:</strong> {selectedAlert.alert_date}</div>
                  <div><strong>Alert Reason:</strong> {selectedAlert.message}</div>
                  <div style={{ marginTop: '6px' }}>
                    <strong>Severity:</strong> <StatusBadge status={selectedAlert.severity} size="small" />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    htmlFor="resolutionNote"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}
                  >
                    Administrative Resolution Note
                  </label>
                  <textarea
                    id="resolutionNote"
                    rows={3}
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    placeholder="Enter reason or verification details (e.g. Approved emergency leave, Verified remote duty, Medical replacement dispatched)..."
                    className="input-control"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResolve}
                    disabled={resolving}
                    className="btn btn-teal"
                  >
                    {resolving ? 'Submitting...' : 'Confirm Resolution'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
