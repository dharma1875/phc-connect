function AttendanceSummaryCard({ label, value, tone = 'default' }) {
  const toneStyles = {
    default: { background: '#f8fafc', color: '#0f172a' },
    success: { background: '#ecfdf5', color: '#065f46' },
    warning: { background: '#fff7ed', color: '#9a5b00' },
    danger: { background: '#fef2f2', color: '#991b1b' },
  };

  return (
    <div style={{ ...styles.card, ...toneStyles[tone] }}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    minHeight: '110px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: 800,
    marginTop: '0.5rem',
  },
};

export default AttendanceSummaryCard;
