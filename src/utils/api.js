// Utility to make API requests with JWT token

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
}

export async function getPatterns() {
  const response = await apiCall('/api/patterns');
  if (!response.ok) throw new Error('Failed to fetch patterns');
  return response.json();
}

export async function startTest(patternId) {
  const response = await apiCall(`/api/patterns/${patternId}/start`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  if (!response.ok) throw new Error('Failed to start test');
  return response.json();
}

export async function register(email, password, name) {
  const response = await apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

export async function login(email, password) {
  const response = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
