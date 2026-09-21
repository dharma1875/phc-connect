import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import StatCard from '../../../components/common/StatCard';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { useToast } from '../../../context/ToastContext';
import { ddhsService } from '../../ddhs/services/ddhsService';
import { alertService } from '../services/alertService';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  RotateCcw,
  Check,
  X,
  Eye,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DDHSAlertsPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const facilityFromUrl = new URLSearchParams(location.search).get('facilityId') || '';

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [filters, setFilters] = useState({
    districtId: '',
    talukId: '',
    facilityId: facilityFromUrl,
    facilityType: '',
    date: '',
    alertType: '',
    severity: '',
    status: 'OPEN',
  });

  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolveModalAlert, setResolveModalAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ddhsService.getDistricts().then(setDistricts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.districtId) {
      setTaluks([]);
      return;
    }
    ddhsService.getTaluksByDistrict(filters.districtId).then(setTaluks).catch(() => {});
  }, [filters.districtId]);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [alertData, summaryData] = await Promise.all([
        alertService.getAlerts(filters),
        alertService.getSummary(),
      ]);
      setAlerts(alertData.alerts || []);
      setSummary(summaryData || {});
    } catch (loadError) {
      setError(loadError.message || 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'districtId' ? { talukId: '' } : {}),
    }));
  };

  const handleAcknowledge = async (id) => {
    try {
      setActionLoading(true);
      await alertService.acknowledge(id);
      showToast('Alert acknowledged successfully.', 'success');
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev) => ({ ...prev, status: 'ACKNOWLEDGED' }));
      }
      loadAlertsData();
    } catch (err) {
      showToast(err.message || 'Unable to acknowledge alert.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolveModalAlert) return;
    try {
      setActionLoading(true);
      await alertService.resolve(resolveModalAlert.id, resolutionNote);
      showToast('Alert marked as resolved.', 'success');
      setResolveModalAlert(null);
      setResolutionNote('');
      if (selectedAlert?.id === resolveModalAlert.id) {
        setSelectedAlert(null);
      }
      loadAlertsData();
    } catch (err) {
      showToast(err.message || 'Unable to resolve alert.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Run automated absence evaluation if needed
  const handleTriggerEvaluation = async () => {
    try {
      showToast('Triggering attendance evaluation...', 'info');
      await alertService.checkAbsenteeism();
      showToast('Absenteeism evaluation completed.', 'success');
      loadAlertsData();
    } catch (err) {
      showToast(err.message || 'Evaluation check finished.', 'info');
      loadAlertsData();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      districtId: '',
      talukId: '',
      facilityId: '',
      facilityType: '',
      date: '',
      alertType: '',
      severity: '',
      status: '',
    });
  };

  return (
    <DashboardLayout
      pageTitle="Absenteeism Alerts Center"
      subtitle="Operational exception tracking, doctor absence warnings, and incident resolution"
      headerRight={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleTriggerEvaluation}
            className="btn btn-secondary btn-sm"
            title="Evaluate doctor attendance against absence thresholds"
          >
            <Sparkles size={14} color="#0284c7" />
            <span>Run Evaluation</span>
          </button>
          <button
            type="button"
            onClick={loadAlertsData}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {error && <ErrorCard message={error} onRetry={loadAlertsData} />}

      {/* ALERT SUMMARY METRIC CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatCard
          title="Open Alerts"
          value={summary.open ?? 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          tone="warning"
          onClick={() => updateFilter('status', 'OPEN')}
        />
        <StatCard
          title="High Severity"
          value={summary.highSeverity ?? 0}
          subtitle="Critical absence alerts"
          icon={ShieldAlert}
          tone="danger"
          onClick={() => updateFilter('severity', 'HIGH')}
        />
        <StatCard
          title="Acknowledged"
          value={summary.acknowledged ?? 0}
          subtitle="Under administrative review"
          icon={Clock}
          tone="primary"
          onClick={() => updateFilter('status', 'ACKNOWLEDGED')}
        />
        <StatCard
          title="Resolved"
          value={summary.resolved ?? 0}
          subtitle="Verified & documented"
          icon={CheckCircle2}
          tone="success"
          onClick={() => updateFilter('status', 'RESOLVED')}
        />
      </div>

      {/* FILTER CONTROLS */}
      <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Filter size={18} color="#0284c7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Filter Alerts
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="input-control"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => updateFilter('severity', e.target.value)}
              className="input-control"
            >
              <option value="">All Severities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* District */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              District
            </label>
            <select
              value={filters.districtId}
              onChange={(e) => updateFilter('districtId', e.target.value)}
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

          {/* Taluk */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Taluk
            </label>
            <select
              value={filters.talukId}
              onChange={(e) => updateFilter('talukId', e.target.value)}
              disabled={!filters.districtId}
              className="input-control"
            >
              <option value="">{filters.districtId ? 'All Taluks' : 'Select District First'}</option>
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
              value={filters.facilityType}
              onChange={(e) => updateFilter('facilityType', e.target.value)}
              className="input-control"
            >
              <option value="">All Types</option>
              <option value="PHC">PHC</option>
              <option value="UPHC">UPHC</option>
              <option value="HSC">HSC</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => updateFilter('date', e.target.value)}
              className="input-control"
            />
          </div>
        </div>

        {(filters.status || filters.severity || filters.districtId || filters.talukId || filters.facilityType || filters.date) && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ALERTS LIST TABLE */}
      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Alerts Found"
          description="There are no active or matching absenteeism alerts for the selected criteria."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Alert Date</th>
                <th>Doctor</th>
                <th>Facility</th>
                <th>Taluk</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Alert Message</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{alert.alert_date}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    {alert.doctor_name || 'N/A'}
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
                  <td>{alert.taluk_name || '—'}</td>
                  <td>
                    <StatusBadge status={alert.severity} size="small" />
                  </td>
                  <td>
                    <StatusBadge status={alert.status} size="small" />
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.85rem', maxWidth: '260px' }}>
                    {alert.message}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="View alert details"
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>

                      {alert.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={actionLoading}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          <Check size={14} />
                          <span>Ack</span>
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolveModalAlert(alert);
                            setResolutionNote('');
                          }}
                          disabled={actionLoading}
                          className="btn btn-teal btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ALERT DETAILS MODAL */}
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
              maxWidth: '560px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Alert Incident Details
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

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>
                  Medical Officer
                </span>
                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                  {selectedAlert.doctor_name || 'N/A'}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>
                  Alert Date
                </span>
                <strong style={{ color: '#0f172a' }}>{selectedAlert.alert_date}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>
                  Healthcare Facility
                </span>
                <strong>{selectedAlert.facility_name} ({selectedAlert.facility_type})</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>
                  Taluk / District
                </span>
                <strong>{selectedAlert.taluk_name} / {selectedAlert.district_name || 'Tamil Nadu'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Severity Level
                </span>
                <StatusBadge status={selectedAlert.severity} size="small" />
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Current Status
                </span>
                <StatusBadge status={selectedAlert.status} size="small" />
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>
                  Reason / Message
                </span>
                <p style={{ color: '#334155', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {selectedAlert.message}
                </p>
              </div>

              {selectedAlert.resolution_note && (
                <div style={{ gridColumn: 'span 2', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>
                    Resolution Note
                  </span>
                  <p style={{ color: '#166534', margin: '2px 0 0', fontSize: '0.85rem' }}>
                    {selectedAlert.resolution_note}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {selectedAlert.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="btn btn-primary"
                >
                  <Check size={16} />
                  <span>Acknowledge Alert</span>
                </button>
              )}

              {selectedAlert.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => {
                    setResolveModalAlert(selectedAlert);
                    setResolutionNote('');
                  }}
                  className="btn btn-teal"
                >
                  <span>Resolve Alert</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveModalAlert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setResolveModalAlert(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={22} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Resolve Alert
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResolveModalAlert(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
              Resolve alert for <strong>{resolveModalAlert.doctor_name}</strong> at <strong>{resolveModalAlert.facility_name}</strong>.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="resolveNoteText"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}
              >
                Resolution Reason / Audit Note
              </label>
              <textarea
                id="resolveNoteText"
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Leave verified with district office, replacement officer deployed, etc."
                className="input-control"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setResolveModalAlert(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveSubmit}
                disabled={actionLoading}
                className="btn btn-teal"
              >
                {actionLoading ? 'Saving...' : 'Confirm & Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}