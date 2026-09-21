import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import { SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { ddhsService } from '../services/ddhsService';
import {
  Building2,
  Search,
  Filter,
  Eye,
  MapPin,
  Users,
  RotateCcw,
} from 'lucide-react';

export default function DDHSFacilitiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('facilityType') || '';
  const initialSearch = searchParams.get('search') || '';

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [facilityType, setFacilityType] = useState(initialType);
  const [search, setSearch] = useState(initialSearch);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch districts on mount
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

  // Fetch taluks when district changes
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

  // Fetch facilities based on filters
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ddhsService.getFacilities({
        districtId: selectedDistrict,
        talukId: selectedTaluk,
        facilityType,
        search,
      });
      setFacilities(data?.facilities || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedDistrict, selectedTaluk, facilityType, search]);

  const handleResetFilters = () => {
    setSelectedDistrict('');
    setSelectedTaluk('');
    setFacilityType('');
    setSearch('');
  };

  const phcCount = facilities.filter((f) => f.facility_type === 'PHC').length;
  const uphcCount = facilities.filter((f) => f.facility_type === 'UPHC').length;
  const hscCount = facilities.filter((f) => f.facility_type === 'HSC').length;

  return (
    <DashboardLayout
      pageTitle="Healthcare Facilities Directory"
      subtitle="Comprehensive roster of Primary Health Centres, Urban Centres, and Sub-Centres"
      headerRight={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchFacilities}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchFacilities} />}

      {/* FILTER BAR CARD */}
      <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Filter size={18} color="#0284c7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Filter Healthcare Facilities
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
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

          {/* Facility Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="input-control"
            >
              <option value="">All Types (PHC, UPHC, HSC)</option>
              <option value="PHC">Primary Health Centre (PHC)</option>
              <option value="UPHC">Urban Primary Health Centre (UPHC)</option>
              <option value="HSC">Health Sub-Centre (HSC)</option>
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Search Facility Name
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type facility name..."
                className="input-control"
                style={{ paddingLeft: '2.2rem' }}
              />
            </div>
          </div>
        </div>

        {(selectedDistrict || selectedTaluk || facilityType || search) && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* QUICK SUMMARY PILLS */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: '#334155',
          }}
        >
          Matching Facilities: <strong style={{ color: '#0284c7' }}>{facilities.length}</strong>
        </span>
        <span
          style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.825rem',
            fontWeight: 700,
          }}
        >
          PHC: {phcCount}
        </span>
        <span
          style={{
            backgroundColor: '#ccfbf1',
            color: '#0f766e',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.825rem',
            fontWeight: 700,
          }}
        >
          UPHC: {uphcCount}
        </span>
        <span
          style={{
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.825rem',
            fontWeight: 700,
          }}
        >
          HSC: {hscCount}
        </span>
      </div>

      {/* FACILITIES TABLE */}
      {loading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Healthcare Facilities Found"
          description="No facilities matched your current filter criteria. Try clearing or expanding your search filters."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Type</th>
                <th>Taluk</th>
                <th>District</th>
                <th>Doctors</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      {facility.name}
                    </div>
                    {facility.address && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                      >
                        <MapPin size={12} />
                        <span>{facility.address}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          facility.facility_type === 'PHC'
                            ? '#0284c7'
                            : facility.facility_type === 'UPHC'
                            ? '#0d9488'
                            : '#6366f1',
                        backgroundColor:
                          facility.facility_type === 'PHC'
                            ? '#e0f2fe'
                            : facility.facility_type === 'UPHC'
                            ? '#ccfbf1'
                            : '#e0e7ff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {facility.facility_type}
                    </span>
                  </td>
                  <td>{facility.taluk_name || '—'}</td>
                  <td>{facility.district_name || 'Tamil Nadu'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#64748b" />
                      <strong style={{ color: '#1e293b' }}>{facility.doctor_count || 0}</strong>
                    </div>
                  </td>
                  <td>
                    <StatusBadge
                      status={facility.status === 'ACTIVE' ? 'OPERATIONAL' : facility.status}
                      size="small"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/ddhs/facility/${facility.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
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
