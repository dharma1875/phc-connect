import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../context/ToastContext';
import { doctorService } from '../../../services/doctorService';
import { serviceService } from '../services/serviceService';
import {
  Stethoscope,
  Baby,
  FlaskConical,
  HeartPulse,
  Pill,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  Calendar,
  Building,
  Info,
  X,
  History,
} from 'lucide-react';

const medicineOptions = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'];

export default function HealthcareServicesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceSummary, setServiceSummary] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    services: [],
  });
  const [formState, setFormState] = useState({});
  const [notes, setNotes] = useState('');
  const [reviewVisible, setReviewVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [profileData, typesData, summaryData] = await Promise.all([
        doctorService.getFacility(),
        serviceService.getServiceTypes(),
        serviceService.getServiceSummary(
          new Date().getMonth() + 1,
          new Date().getFullYear()
        ),
      ]);

      setFacility(profileData);
      setServiceTypes(typesData || []);
      setServiceSummary(
        summaryData || {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          services: [],
        }
      );

      // Initialize form values
      const initial = {};
      (typesData || []).forEach((type) => {
        if (type.name === 'Medicine Stock Status') {
          initial[type.id] = 'AVAILABLE';
        } else {
          initial[type.id] = '';
        }
      });
      setFormState(initial);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load healthcare services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (typeId, value) => {
    setFormState((prev) => ({
      ...prev,
      [typeId]: value,
    }));
  };

  const handleOpenReview = (e) => {
    e.preventDefault();
    setError('');

    // Check if at least one value was entered
    const hasValues = Object.entries(formState).some(([key, val]) => {
      const type = serviceTypes.find((t) => t.id === Number(key));
      if (type?.name === 'Medicine Stock Status') return true;
      return val !== '' && val !== null && !isNaN(val) && Number(val) >= 0;
    });

    if (!hasValues) {
      setError('Please fill in at least one service count before submitting.');
      return;
    }

    setReviewVisible(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const reportsPayload = serviceTypes
        .map((type) => {
          const val = formState[type.id];
          if (type.name === 'Medicine Stock Status') {
            return {
              serviceTypeId: type.id,
              value: val || 'AVAILABLE',
            };
          }
          if (val === '' || val === null || isNaN(val)) {
            return null;
          }
          return {
            serviceTypeId: type.id,
            value: Number(val),
          };
        })
        .filter(Boolean);

      await serviceService.submitReport({
        serviceDate: selectedDate,
        notes,
        services: reportsPayload,
      });

      showToast('Daily healthcare report submitted successfully!', 'success');
      setReviewVisible(false);
      await fetchData();
      navigate('/doctor/services/history');
    } catch (submitError) {
      showToast(submitError.message || 'Unable to submit service report.', 'error');
      setError(submitError.message || 'Unable to submit service report.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group services logically
  const categorizedServices = useMemo(() => {
    const outpatient = [];
    const maternalChild = [];
    const labMedicine = [];

    serviceTypes.forEach((type) => {
      const name = type.name.toLowerCase();
      if (name.includes('opd') || name.includes('emergency') || name.includes('referral')) {
        outpatient.push(type);
      } else if (
        name.includes('anc') ||
        name.includes('pnc') ||
        name.includes('deliver') ||
        name.includes('vaccin') ||
        name.includes('immuniz')
      ) {
        maternalChild.push(type);
      } else {
        labMedicine.push(type);
      }
    });

    return { outpatient, maternalChild, labMedicine };
  }, [serviceTypes]);

  return (
    <DashboardLayout
      pageTitle="Healthcare Service Reporting"
      subtitle={`Daily clinical and patient consultation reporting &bull; ${facility?.name || 'Primary Health Centre'}`}
      headerRight={
        <button
          type="button"
          onClick={() => navigate('/doctor/services/history')}
          className="btn btn-secondary btn-sm"
        >
          <History size={14} />
          <span>Service History</span>
        </button>
      }
    >
      {error && <ErrorCard message={error} />}

      {loading ? (
        <SkeletonTable rows={5} columns={4} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }} className="service-layout-grid">
          {/* LEFT: MULTI-SECTION SERVICE SUBMISSION FORM */}
          <form onSubmit={handleOpenReview}>
            {/* Header / Date Selector Card */}
            <div className="card-base" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical Reporting Entry
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Record counts of patients treated and interventions conducted today
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
                    Service Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-control"
                    style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
                  />
                </div>
              </div>
            </div>

            {/* CATEGORY 1: OUTPATIENT & EMERGENCY */}
            {categorizedServices.outpatient.length > 0 && (
              <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <Stethoscope size={20} color="#0284c7" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Outpatient &amp; General Consultations
                  </h4>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {categorizedServices.outpatient.map((type) => (
                    <div key={type.id}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {type.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formState[type.id] ?? ''}
                        onChange={(e) => handleInputChange(type.id, e.target.value)}
                        placeholder="e.g. 35"
                        className="input-control"
                      />
                      {type.description && (
                        <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                          {type.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY 2: MATERNAL & CHILD HEALTH */}
            {categorizedServices.maternalChild.length > 0 && (
              <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <Baby size={20} color="#0d9488" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Maternal &amp; Child Health (ANC, PNC, Immunizations)
                  </h4>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {categorizedServices.maternalChild.map((type) => (
                    <div key={type.id}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {type.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formState[type.id] ?? ''}
                        onChange={(e) => handleInputChange(type.id, e.target.value)}
                        placeholder="e.g. 12"
                        className="input-control"
                      />
                      {type.description && (
                        <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                          {type.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY 3: DIAGNOSTICS & PHARMACY */}
            {categorizedServices.labMedicine.length > 0 && (
              <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <FlaskConical size={20} color="#6366f1" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Diagnostic Laboratory &amp; Stock Inventory
                  </h4>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {categorizedServices.labMedicine.map((type) => (
                    <div key={type.id}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {type.name}
                      </label>

                      {type.name === 'Medicine Stock Status' ? (
                        <select
                          value={formState[type.id] || 'AVAILABLE'}
                          onChange={(e) => handleInputChange(type.id, e.target.value)}
                          className="input-control"
                        >
                          {medicineOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={formState[type.id] ?? ''}
                          onChange={(e) => handleInputChange(type.id, e.target.value)}
                          placeholder="e.g. 15"
                          className="input-control"
                        />
                      )}

                      {type.description && (
                        <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                          {type.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES & SUBMIT CARD */}
            <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Clinical Observations &amp; Operational Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notable patient trends, immunization camp observations, medicine restocking notes, or special cases..."
                  className="input-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-teal btn-lg"
                  style={{ gap: '8px' }}
                >
                  <Send size={18} />
                  <span>Review &amp; Submit Daily Report</span>
                </button>
              </div>
            </div>
          </form>

          {/* RIGHT: MONTHLY PROGRESS & GUIDELINES SIDE PANEL */}
          <div>
            {/* Monthly Performance Card */}
            <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                This Month's Activity
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                Month {serviceSummary.month} / {serviceSummary.year}
              </div>

              {serviceSummary.services?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  No service reports recorded for this month yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {serviceSummary.services.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                        {item.service_type_name}
                      </span>
                      <strong style={{ color: '#0284c7', fontSize: '0.95rem' }}>
                        {item.total_value}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Government Guidelines Card */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '16px',
                padding: '1.25rem',
                fontSize: '0.825rem',
                color: '#1e3a5f',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                <Info size={16} color="#0284c7" />
                <span>Reporting Policy</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                Daily service submissions are compiled directly for the Directorate of Public Health and Preventive Medicine (DDHS). Ensure verified tallies are entered before shift handover.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION & REVIEW MODAL */}
      {reviewVisible && (
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
          onClick={() => setReviewVisible(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={22} color="#0d9488" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Verify Healthcare Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewVisible(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Reporting Date:</strong> {selectedDate}</div>
              <div><strong>Facility:</strong> {facility?.name || 'Primary Health Centre'}</div>
            </div>

            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                marginBottom: '1.25rem',
              }}
            >
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Service Category</th>
                    <th style={{ textAlign: 'right' }}>Submitted Count</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceTypes
                    .filter((t) => formState[t.id] !== '' && formState[t.id] !== null)
                    .map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                          {formState[t.id]}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {notes && (
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                <strong>Notes:</strong> {notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setReviewVisible(false)}
                className="btn btn-secondary"
              >
                Modify
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="btn btn-teal"
              >
                {submitting ? 'Submitting...' : 'Confirm & Finalize Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
