import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { ddhsService } from '../services/ddhsService';
import {
  Activity,
  Filter,
  RotateCcw,
  Stethoscope,
  Baby,
  Syringe,
  FlaskConical,
  HeartPulse,
} from 'lucide-react';

export default function DDHSServicesPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [taluks, setTaluks] = useState([]);
  const [facilityId, setFacilityId] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState([]);
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

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError('');
      const [summaryData, servicesData] = await Promise.all([
        ddhsService.getServiceSummary({
          districtId: selectedDistrict,
          talukId: selectedTaluk,
          facilityId,
          facilityType,
          date,
          serviceTypeId,
        }),
        ddhsService.getServices({
          districtId: selectedDistrict,
          talukId: selectedTaluk,
          facilityId,
          facilityType,
          date,
          serviceTypeId,
        }),
      ]);
      setSummary(summaryData?.services || []);
      setServices(servicesData?.services || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load services data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [selectedDistrict, selectedTaluk, facilityId, facilityType, date, serviceTypeId]);

  const handleReset = () => {
    setSelectedDistrict('');
    setSelectedTaluk('');
    setFacilityType('');
    setFacilityId('');
    setServiceTypeId('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  // Compute total service reports count
  const totalCount = summary.reduce((acc, curr) => acc + (Number(curr.total_value) || 0), 0);

  const getServiceIcon = (name) => {
    const n = String(name || '').toLowerCase();
    if (n.includes('anc') || n.includes('pnc') || n.includes('deliveries')) return Baby;
    if (n.includes('vaccin') || n.includes('immuniz')) return Syringe;
    if (n.includes('lab')) return FlaskConical;
    if (n.includes('emergency')) return HeartPulse;
    return Stethoscope;
  };

  return (
    <DashboardLayout
      pageTitle="Healthcare Services Monitoring"
      subtitle={`Daily clinical output tracking across PHCs, UPHCs, and HSCs &bull; Date: ${date}`}
      headerRight={
        <button
          type="button"
          onClick={fetchServiceData}
          className="btn btn-secondary btn-sm"
        >
          <RotateCcw size={14} />
          <span>Refresh</span>
        </button>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchServiceData} />}

      {/* SERVICE SUMMARY KPI CARDS */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
          Daily Output Summary ({totalCount} total patient interactions)
        </h3>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
            <SkeletonCard height="110px" />
          </div>
        ) : summary.length === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            No healthcare services logged for this date.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
            }}
          >
            {summary.map((item, index) => {
              const Icon = getServiceIcon(item.service_type_name);
              return (
                <StatCard
                  key={index}
                  title={item.service_type_name}
                  value={item.total_value ?? 0}
                  subtitle={`${item.report_count || 0} reporting doctors`}
                  icon={Icon}
                  tone={index % 2 === 0 ? 'teal' : 'primary'}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER BAR CARD */}
      <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Filter size={18} color="#0284c7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Filter Service Reports
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
              Service Date
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
        </div>

        {(selectedDistrict || selectedTaluk || facilityType || date !== new Date().toISOString().slice(0, 10)) && (
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

      {/* SERVICE REPORTS LOGS TABLE */}
      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Service Reports Found"
          description="No clinical service reports were found matching the selected filters."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Facility</th>
                <th>Facility Type</th>
                <th>Taluk</th>
                <th>Service Type</th>
                <th>Count / Metric</th>
                <th>Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {services.map((row, index) => (
                <tr key={row.id || index}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.doctor_name}</td>
                  <td>{row.facility_name}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          row.facility_type === 'PHC'
                            ? '#0284c7'
                            : row.facility_type === 'UPHC'
                            ? '#0d9488'
                            : '#6366f1',
                        backgroundColor:
                          row.facility_type === 'PHC'
                            ? '#e0f2fe'
                            : row.facility_type === 'UPHC'
                            ? '#ccfbf1'
                            : '#e0e7ff',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {row.facility_type}
                    </span>
                  </td>
                  <td>{row.taluk_name || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {row.service_type_name}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#0284c7',
                        fontFeatureSettings: '"cv02", "cv03"',
                      }}
                    >
                      {row.value}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '240px' }}>
                    {row.notes || '—'}
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
