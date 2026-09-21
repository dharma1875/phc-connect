import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/LoadingSkeleton';
import ErrorCard from '../../components/common/ErrorCard';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { doctorService } from '../../services/doctorService';
import { serviceService } from '../../features/services/services/serviceService';
import {
  Stethoscope,
  UserCheck,
  Building,
  Activity,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  MapPin,
  History,
  Phone,
  Sparkles,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [serviceReportData, setServiceReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDoctorDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboard, attendance, services] = await Promise.all([
        doctorService.getDashboard(),
        doctorService.getTodayAttendance(),
        serviceService.getTodayReport(),
      ]);

      setDashboardData(dashboard);
      setAttendanceData(attendance?.attendance || null);
      setServiceReportData(services || { status: 'NOT_SUBMITTED', serviceDate: null });
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  // Personalized greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const doctor = dashboardData?.doctor || {};
  const facility = dashboardData?.facility || {};
  const attendanceStatus = attendanceData?.status || 'NOT_MARKED';
  const checkInTime = attendanceData?.check_in_time || null;
  const checkOutTime = attendanceData?.check_out_time || null;
  const isCheckedIn = Boolean(checkInTime);
  const isCheckedOut = Boolean(checkOutTime);

  const reportStatus = serviceReportData?.status || 'NOT_SUBMITTED';
  const reportDate = serviceReportData?.serviceDate || null;
  const servicesSubmittedCount = serviceReportData?.items?.length || 0;
  const totalServiceCount = (serviceReportData?.items || []).reduce(
    (acc, curr) => acc + (Number(curr.value) || 0),
    0
  );

  const doctorName = doctor.name || user?.name || 'Doctor';

  // Mark Attendance Handler
  const handleMarkAttendance = async () => {
    try {
      setActionLoading(true);
      const res = await doctorService.markAttendance();
      showToast('Attendance marked successfully! Check-in time recorded.', 'success');
      await fetchDoctorDashboard();
    } catch (markError) {
      showToast(markError.message || 'Failed to mark attendance.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Check-Out Handler
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await doctorService.checkOutAttendance();
      showToast('Shift checked out successfully.', 'success');
      await fetchDoctorDashboard();
    } catch (checkOutError) {
      showToast(checkOutError.message || 'Failed to record check-out.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {error && <ErrorCard message={error} onRetry={fetchDoctorDashboard} />}

      {loading ? (
        <div>
          <SkeletonCard height="160px" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <>
          {/* WELCOME HERO BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f2038 0%, #162a45 60%, #0284c7 100%)',
              borderRadius: '20px',
              padding: '2rem 2.25rem',
              color: '#ffffff',
              marginBottom: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.12)',
            }}
          >
            {/* Background subtle art */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#e0f2fe',
                  }}
                >
                  Doctor Portal &bull; {facility.facility_type || 'PHC'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.35rem',
                }}
              >
                {greeting}, Dr. {doctorName}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 1.25rem' }}>
                Here's your healthcare duty overview and service activity for today.
              </p>

              {/* Quick Facility Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <Building size={15} color="#38bdf8" />
                  <span>
                    <strong>Assigned:</strong> {facility.name || 'Primary Health Centre'}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <MapPin size={15} color="#38bdf8" />
                  <span>
                    {facility.taluk || 'Taluk'} &bull; {facility.district || 'Tamil Nadu'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO PRIMARY ACTION CARDS: ATTENDANCE HERO & SERVICE SUBMISSION */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* 1. TODAY'S ATTENDANCE WIDGET */}
            <div
              className="card-base"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Today's Attendance
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Biometric / Portal Check-In
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={attendanceStatus} />
                </div>

                {/* Status Body */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    margin: '1rem 0 1.5rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Check-in Time
                      </div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: checkInTime ? '#0f172a' : '#94a3b8',
                          marginTop: '2px',
                        }}
                      >
                        {checkInTime || '—'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Check-out Time
                      </div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: checkOutTime ? '#0f172a' : '#94a3b8',
                          marginTop: '2px',
                        }}
                      >
                        {checkOutTime || '—'}
                      </div>
                    </div>
                  </div>

                  {!isCheckedIn && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        fontSize: '0.8rem',
                        color: '#b45309',
                        backgroundColor: '#fffbeb',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #fde68a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Clock size={14} />
                      <span>Please mark attendance before 10:00 AM cutoff to prevent alerts.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isCheckedIn ? (
                  <button
                    type="button"
                    onClick={handleMarkAttendance}
                    disabled={actionLoading}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, gap: '8px' }}
                  >
                    <UserCheck size={18} />
                    <span>{actionLoading ? 'Recording...' : 'Mark Present Today'}</span>
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, gap: '8px', borderColor: '#0284c7', color: '#0284c7' }}
                  >
                    <Clock size={18} />
                    <span>{actionLoading ? 'Recording...' : 'Record Check-Out'}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    ✓ Shift Complete for Today
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/doctor/attendance')}
                  className="btn btn-secondary"
                  title="View complete attendance history"
                >
                  <History size={16} />
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* 2. HEALTHCARE SERVICES REPORT CARD */}
            <div
              className="card-base"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#ccfbf1',
                        color: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Healthcare Services
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Daily Clinical Output (OPD, ANC, PNC, Labs)
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={reportStatus} />
                </div>

                {/* Summary Info */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    margin: '1rem 0 1.5rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Status Today
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {reportStatus === 'SUBMITTED' ? 'Report Logged' : 'Pending Submission'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Report Date
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {reportDate || new Date().toISOString().slice(0, 10)}
                      </div>
                    </div>
                  </div>

                  {reportStatus === 'SUBMITTED' && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        fontSize: '0.825rem',
                        color: '#0f766e',
                        backgroundColor: '#f0fdfa',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #99f6e4',
                      }}
                    >
                      ✓ {servicesSubmittedCount} service categories logged ({totalServiceCount} total services recorded).
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/doctor/services')}
                  className="btn btn-teal btn-lg"
                  style={{ flex: 1, gap: '8px' }}
                >
                  <Stethoscope size={18} />
                  <span>
                    {reportStatus === 'SUBMITTED' ? 'Update Service Report' : 'Submit Today\'s Report'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/doctor/services/history')}
                  className="btn btn-secondary"
                  title="View submission logs"
                >
                  <FileText size={16} />
                  <span>History</span>
                </button>
              </div>
            </div>
          </div>

          {/* DOCTOR PROFILE & FACILITY ASSIGNMENT CARD */}
          <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} color="#0284c7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Assigned Healthcare Facility
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/doctor/facility')}
                className="btn btn-secondary btn-sm"
              >
                <span>View Full Facility Info</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Facility Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {facility.name || 'Not assigned'}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Facility Type</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                  {facility.type || facility.facility_type || 'PHC'}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Taluk &amp; District</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {facility.taluk || '—'}, {facility.district || 'Tamil Nadu'}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Account Status</div>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status="ACTIVE" size="small" />
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Doctor Quick Actions
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                {
                  title: 'Mark Attendance',
                  desc: 'Log shift start or record check-out',
                  path: '/doctor/attendance',
                  icon: UserCheck,
                  color: '#16a34a',
                },
                {
                  title: 'Daily Service Report',
                  desc: 'Submit OPD, ANC, PNC & lab statistics',
                  path: '/doctor/services',
                  icon: Stethoscope,
                  color: '#0d9488',
                },
                {
                  title: 'Attendance History',
                  desc: 'Review past attendance logs & statuses',
                  path: '/doctor/attendance',
                  icon: History,
                  color: '#0284c7',
                },
                {
                  title: 'Service History',
                  desc: 'Inspect submitted patient activity records',
                  path: '/doctor/services/history',
                  icon: FileText,
                  color: '#6366f1',
                },
                {
                  title: 'My Profile & Facility',
                  desc: 'View medical credentials & postings',
                  path: '/doctor/profile',
                  icon: ShieldCheck,
                  color: '#0369a1',
                },
              ].map((act, i) => {
                const ActionIcon = act.icon;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(act.path)}
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
                          backgroundColor: `${act.color}15`,
                          color: act.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ActionIcon size={18} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                        {act.title}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {act.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
