import { jwtDecode } from 'jwt-decode';

export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
};

export const getUserInfo = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}; 