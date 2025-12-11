// src/App.js
import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import NotFound from './views/auth/notFound';
import {
  ChakraProvider,
} from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import { useAuthStore } from './stores/useAuthStore'; // Importa el store

// Componente para rutas protegidas (usuario autenticado)
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="auth/*" 
          element={
            <AuthLayout 
              theme={currentTheme} 
              setTheme={setCurrentTheme} 
            />
          } 
        />
        
        {/* Rutas protegidas para usuarios autenticados */}
        <Route
          path="user/*"
          element={
            <ProtectedRoute>
              <AdminLayout 
                theme={currentTheme} 
                setTheme={setCurrentTheme} 
              />
            </ProtectedRoute>
          }
        />
        
        {/* Ruta especial para reportes admin - protegida doblemente */}
        <Route
          path="admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout 
                theme={currentTheme} 
                setTheme={setCurrentTheme} 
              />
            </ProtectedRoute>
          }
        />
        
        {/* Otras rutas */}
        <Route
          path="rtl/*"
          element={
            <RTLLayout 
              theme={currentTheme} 
              setTheme={setCurrentTheme} 
            />
          }
        />
        
        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ChakraProvider>
  );
}