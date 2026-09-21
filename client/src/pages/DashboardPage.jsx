import { useAuth } from '../hooks/useAuth';

function DashboardPage({ title, roleLabel }) {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>{title}</h1>
      <p>Welcome, {roleLabel}</p>
      <p>Authentication successful.</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default DashboardPage;
