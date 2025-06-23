export async function protectRoute(requiredRole = 'user') {
  const isAuth = await checkAuth();
  
  if (!isAuth) {
    window.location.href = 'cliente_login.html';
    return false;
  }
  
  const user = getUserData();
  
  // Employee route protection
  if (requiredRole === 'employee' && user.role !== 'employee') {
    window.location.href = 'index.html';
    return false;
  }
  
  return true;
}