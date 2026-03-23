import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles = [] }) {
    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={userRole === 'Admin' ? '/admin' : '/dashboard'} replace />;
    }

    return children;
}

export default ProtectedRoute;