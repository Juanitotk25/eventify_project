// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from 'stores/useAuthStore';

const AdminRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  
  // Verificar autenticación
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  // Verificar rol de administrador
  if (role !== 'admin') {
    // Puedes mostrar un mensaje o redirigir a una página de acceso denegado
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;