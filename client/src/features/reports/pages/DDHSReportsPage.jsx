import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { BarTrendChart } from '../../../components/common/Charts';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { ddhsService } from '../../ddhs/services/ddhsService';
import { reportService } from '../services/reportService';
import {
  FileBarChart2,
  Download,
  Filter,
  RotateCcw,
  Calendar,
  Building2,
  UserCheck,
  Activity,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);
const weekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return date.toISOString().slice(0, 10);
};

export default function DDHSReportsPage() {
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [filters, setFilters] = useState({
    districtId: '',
    talukId: '',
    facilityType: '',
    facilityId: '',
    fromDate: weekAgo(),
    toDate: today(),
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    ddhsService
      .getFacilities({
        districtId: filters.districtId,
        talukId: filters.talukId,
        facilityType: filters.facilityType,
      })
      .then((res) => setFacilities(res.facilities || []))
      .catch(() => {});
  }, [filters.districtId, filters.talukId, filters.facilityType]);

  const loadReports = async (nextFilters = filters) => {
    setError('');
    if (nextFilters.fromDate > nextFilters.toDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      setLoading(true);
      const [
        summary,
        attendance,
        attendanceTrend,
        services,
        serviceTrend,
        absenteeism,
        absenteeismTrend,
        facilityReport,
        talukReport,
        typeReport,
      ] = await Promise.all([
        reportService.getSummary(nextFilters),
        reportService.getAttendance(nextFilters),
        reportService.getAttendanceTrend(nextFilters),
        reportService.getServices(nextFilters),
        reportService.getServiceTrend(nextFilters),
        reportService.getAbsenteeism(nextFilters),
        reportService.getAbsenteeismTrend(nextFilters),
        reportService.getFacilities(nextFilters),
        reportService.getTaluks(nextFilters),
        reportService.getFacilityTypes(nextFilters),
      ]);

      setData({
        summary: summary.summary,
        attendance: attendance.attendance,
        attendanceTrend: attendanceTrend.trend,
        services: services.services,
        serviceTrend: serviceTrend.trend,
        absenteeism: absenteeism.absenteeism,
        absenteeismTrend: absenteeismTrend.trend,
        facilities: facilityReport.facilities,
        taluks: talukReport.taluks,
        types: typeReport.facilityTypes,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load comprehensive reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'districtId' ? { talukId: '', facilityId: '' } : {}),
      ...(key === 'talukId' || key === 'facilityType' ? { facilityId: '' } : {}),
    }));
  };

  const handleReset = () => {
    const defaultFilters = {
      districtId: '',
      talukId: '',
      facilityType: '',
      facilityId: '',
      fromDate: weekAgo(),
      toDate: today(),
    };
    setFilters(defaultFilters);
    loadReports(defaultFilters);
  };

  const handleQuickRange = (kind) => {
    const end = today();
    const start =
      kind === 'today'
        ? end
        : kind === 'month'
        ? `${end.slice(0, 8)}01`
        : weekAgo();
    const next = { ...filters, fromDate: start, toDate: end };
    setFilters(next);
    loadReports(next);
  };

  const exportCsv = () => {
    const rows = [
      ['Facility', 'Type', 'Doctors', 'Attendance %', 'Service Reports', 'Open Alerts'],
      ...(data?.facilities || []).map((item) => [
        item.facilityName,
        item.facilityType,
        item.doctorCount,
        item.attendancePercentage,
        item.serviceReports,
        item.openAlerts,
      ]),
    ];
    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `phc-connect-facility-report-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Format trend charts data
  const attendanceTrendData = (data?.attendanceTrend || []).map((item) => ({
    label: item.date?.slice(5) || item.date,
    value: Number(item.present) || 0,
    color: '#16a34a',
  }));

  const absenteeismTrendData = (data?.absenteeismTrend || []).map((item) => ({
    label: item.date?.slice(5) || item.date,
    value: Number(item.alerts) || 0,
    color: '#dc2626',
  }));

  return (
    <DashboardLayout
      pageTitle="DDHS Reports &amp; Analytics"
      subtitle={`Comprehensive analytical reporting and statistical exports &bull; ${filters.fromDate} to ${filters.toDate}`}
      headerRight={
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data?.facilities?.length}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => loadReports()}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {error && <ErrorCard message={error} onRetry={() => loadReports()} />}

      {/* FILTER BAR WITH PRESETS */}
      <div className="card-base" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#0284c7" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Report Filters &amp; Date Range
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickRange('today')}
              className="btn btn-secondary btn-sm"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange('week')}
              className="btn btn-secondary btn-sm"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange('month')}
              className="btn btn-secondary btn-sm"
            >
              This Month
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilter('fromDate', e.target.value)}
              className="input-control"
            />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilter('toDate', e.target.value)}
              className="input-control"
            />
          </div>

          {/* District */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              District
            </label>
            <select
              value={filters.districtId}
              onChange={(e) => setFilter('districtId', e.target.value)}
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
              onChange={(e) => setFilter('talukId', e.target.value)}
              disabled={!filters.districtId}
              className="input-control"
            >
              <option value="">{filters.districtId ? 'All Taluks' : 'Select District'}</option>
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
              onChange={(e) => setFilter('facilityType', e.target.value)}
              className="input-control"
            >
              <option value="">All Types</option>
              <option value="PHC">PHC</option>
              <option value="UPHC">UPHC</option>
              <option value="HSC">HSC</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary btn-sm"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => loadReports()}
            className="btn btn-primary btn-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonTable rows={5} columns={6} />
        </div>
      ) : !data ? (
        <EmptyState title="No report data generated" />
      ) : (
        <>
          {/* HIGH-LEVEL SUMMARY KPI CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <StatCard
              title="Facilities In Scope"
              value={data.summary?.facilities?.total || 0}
              subtitle={`${data.summary?.facilities?.active || 0} Active centers`}
              icon={Building2}
              tone="primary"
            />
            <StatCard
              title="Registered Doctors"
              value={data.summary?.doctors || 0}
              subtitle="Medical officers"
              icon={UserCheck}
              tone="neutral"
            />
            <StatCard
              title="Total Doctor-Days Present"
              value={data.attendance?.present || 0}
              subtitle={`Out of ${data.attendance?.totalDoctors || 0} expected`}
              icon={Activity}
              tone="success"
            />
            <StatCard
              title="Service Reports Logged"
              value={data.summary?.services?.reports || 0}
              subtitle="Cumulative submissions"
              icon={TrendingUp}
              tone="teal"
            />
            <StatCard
              title="Absenteeism Alerts"
              value={data.summary?.alerts?.open || 0}
              subtitle={`${data.summary?.alerts?.highSeverity || 0} High severity`}
              icon={AlertTriangle}
              tone="danger"
            />
          </div>

          {/* ATTENDANCE & ABSENTEEISM ANALYTICS CHARTS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Attendance Trend Bar Chart */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Doctor Attendance Trend (Present by Date)
                </h3>
                <StatusBadge status="PRESENT" size="small" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                Daily verified doctor presence over the selected date window
              </p>
              <BarTrendChart
                data={attendanceTrendData}
                valueKey="value"
                labelKey="label"
                color="#16a34a"
              />
            </div>

            {/* Absenteeism Trend Bar Chart */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Absenteeism Alerts Trend
                </h3>
                <StatusBadge status="HIGH" size="small" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                Daily count of automated absenteeism alerts generated
              </p>
              <BarTrendChart
                data={absenteeismTrendData}
                valueKey="value"
                labelKey="label"
                color="#dc2626"
              />
            </div>
          </div>

          {/* FACILITY PERFORMANCE TABLE (WITH CSV EXPORT) */}
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
                  Facility Performance &amp; Staffing Overview
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Detailed breakdown per facility including attendance rates and open alerts
                </div>
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="btn btn-primary btn-sm"
              >
                <Download size={14} />
                <span>Export Dataset (.CSV)</span>
              </button>
            </div>

            {data.facilities?.length === 0 ? (
              <EmptyState title="No facility report data" />
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Facility Name</th>
                      <th>Type</th>
                      <th>Doctors Assigned</th>
                      <th>Attendance Rate</th>
                      <th>Service Reports</th>
                      <th>Open Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.facilities.map((fac, idx) => (
                      <tr key={fac.id || fac.facilityId || idx}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {fac.facilityName || fac.name}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color:
                                fac.facilityType === 'PHC'
                                  ? '#0284c7'
                                  : fac.facilityType === 'UPHC'
                                  ? '#0d9488'
                                  : '#6366f1',
                              backgroundColor:
                                fac.facilityType === 'PHC'
                                  ? '#e0f2fe'
                                  : fac.facilityType === 'UPHC'
                                  ? '#ccfbf1'
                                  : '#e0e7ff',
                              padding: '2px 7px',
                              borderRadius: '6px',
                            }}
                          >
                            {fac.facilityType}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{fac.doctorCount ?? 0}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: (fac.attendancePercentage || 0) >= 80 ? '#16a34a' : '#d97706' }}>
                              {fac.attendancePercentage ?? 0}%
                            </strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#0284c7' }}>
                            {fac.serviceReports ?? 0}
                          </span>
                        </td>
                        <td>
                          {(fac.openAlerts || 0) > 0 ? (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>
                              {fac.openAlerts} alerts
                            </span>
                          ) : (
                            <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>0 alerts</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TALUK & FACILITY TYPE BREAKDOWN TABLES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Taluk Summary */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Taluk Administrative Summary
              </h3>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Taluk</th>
                      <th>Facilities</th>
                      <th>Doctors</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.taluks || []).map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{t.talukName}</td>
                        <td>{t.facilities}</td>
                        <td>{t.doctors}</td>
                        <td>
                          <strong style={{ color: '#0284c7' }}>{t.attendancePercentage}%</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Facility Type Summary */}
            <div className="card-base" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                Facility Type Comparison
              </h3>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Facilities</th>
                      <th>Doctors</th>
                      <th>Present</th>
                      <th>Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.types || []).map((tp, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{tp.facilityType}</td>
                        <td>{tp.facilities}</td>
                        <td>{tp.doctors}</td>
                        <td>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>{tp.present}</span>
                        </td>
                        <td>
                          <span style={{ color: tp.alerts > 0 ? '#dc2626' : '#64748b' }}>
                            {tp.alerts}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}