import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminPanel from './pages/AdminPanel';
import ShiftHistory from './pages/ShiftHistory';
import AllEmployeesPage from './pages/AllEmployeesPage';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <Navbar />
                
                <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/shift-history"
                            element={
                                <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
                                    <ShiftHistory />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/all-employees"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <AllEmployeesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee-details/:employeeNumber"
                            element={
                                <ProtectedRoute allowedRoles={['Admin']}>
                                    <EmployeeDetailsPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;