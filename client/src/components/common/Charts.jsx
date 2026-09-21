import { useState } from 'react';

/**
 * DonutChart Component
 * SVG-based, responsive, interactive with legend and center summary.
 */
export function DonutChart({
  data = [],
  centerTitle = 'Total',
  centerValue,
  size = 180,
  strokeWidth = 26,
  showLegend = true,
  onSegmentClick,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const displayCenter = centerValue !== undefined ? centerValue : total;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            data.map((item, index) => {
              const val = Number(item.value) || 0;
              if (val <= 0) return null;
              const fraction = val / total;
              const strokeDasharray = `${circumference * fraction} ${circumference * (1 - fraction)}`;
              const strokeDashoffset = -accumulatedAngle;
              accumulatedAngle += circumference * fraction;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.label || index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color || '#0284c7'}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    cursor: onSegmentClick ? 'pointer' : 'default',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSegmentClick && onSegmentClick(item)}
                />
              );
            })
          )}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {displayCenter}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
            {hoveredIndex !== null ? data[hoveredIndex]?.label : centerTitle}
          </span>
        </div>
      </div>

      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem 1.25rem', width: '100%' }}>
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const pct = total > 0 ? Math.round(((Number(item.value) || 0) / total) * 100) : 0;
            return (
              <div
                key={item.label || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: onSegmentClick ? 'pointer' : 'default',
                  opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick && onSegmentClick(item)}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color || '#0284c7',
                  }}
                />
                <span style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  ({item.value} &middot; {pct}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * BarTrendChart Component
 * Clean modern horizontal or vertical bar trend visualizer
 */
export function BarTrendChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  color = '#0284c7',
  maxHeight = 180,
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        No trend data available.
      </div>
    );
  }

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values, 1);

  return (
    <div style={{ width: '100%', paddingTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '8px',
          height: maxHeight,
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '4px',
        }}
      >
        {data.map((item, idx) => {
          const val = Number(item[valueKey]) || 0;
          const heightPct = Math.max(Math.round((val / maxVal) * 100), 4);
          const barColor = item.color || color;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
              title={`${item[labelKey]}: ${val}`}
            >
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: '4px',
                }}
              >
                {val}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPct}%`,
                  backgroundColor: barColor,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '6px' }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item[labelKey]}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ProgressBarGroup Component
 * Horizontal progress tracks with badges
 */
export function ProgressBarGroup({ items = [] }) {
  const total = items.reduce((acc, it) => acc + (Number(it.value) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%' }}>
      {items.map((item, i) => {
        const val = Number(item.value) || 0;
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: item.color || '#0284c7' }}>
                {val} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: '999px',
                  backgroundColor: item.color || '#0284c7',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
