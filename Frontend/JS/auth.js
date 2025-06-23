export function isAuthenticated() {
  return localStorage.getItem('authToken') !== null;
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'cliente_login.html';
}

export async function checkAuth() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch('http://localhost:3000/api/auth/verify-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function authHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function authenticateEmployee(id, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/employee/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });

    if (response.ok) {
      const { token, employee } = await response.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify({
        ...employee,
        role: 'employee'
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}