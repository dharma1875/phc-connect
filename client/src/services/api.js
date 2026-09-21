const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || 'Request failed.';
    throw new Error(errorMessage);
  }

  return data;
}

export default {
  request,
};
