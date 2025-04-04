//@ts-nocheck
import { Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { HomePage } from './pages/Home';
import { UploadPage } from './pages/Upload';
import { YouTubePage } from './pages/YouTube';
import { SettingsPage } from './pages/Settings';
import Login from './components/Login';
import Register from './components/Reg';
import { theme } from './theme';
import './styles/navigation.css';

// Auth protection helper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated - simplified version for demo
  const isAuthenticated = localStorage.getItem('access_token') !== null;
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/youtube" 
          element={
            <ProtectedRoute>
              <YouTubePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MantineProvider>
  );
} 