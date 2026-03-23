import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const navLinkBase =
    'rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10';
const activeNavLink = 'bg-white/15 text-white';
const inactiveNavLink = 'text-blue-100';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('userRole');

    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    useEffect(() => {
        if (userRole === 'Admin') {
            fetchEmployees();
        }
    }, [userRole]);

    useEffect(() => {
        if (searchTerm) {
            setFilteredEmployees(
                employees.filter((employee) =>
                    employee.employeeNumber.toString().includes(searchTerm)
                )
            );
        } else {
            setFilteredEmployees(employees);
        }
    }, [searchTerm, employees]);

    const fetchEmployees = async () => {
        try {
            const response = await apiClient.get('/api/admin/AllEmployees');
            setEmployees(response.data);
        } catch (err) {
            console.error('Failed to fetch employees');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleViewShifts = () => {
        if (userRole === 'Admin' && selectedEmployee) {
            navigate(`/shift-history?employeeNumber=${selectedEmployee}`);
        } else if (userRole === 'Employee') {
            const employeeNumber = localStorage.getItem('employeeNumber');
            navigate(`/shift-history?employeeNumber=${employeeNumber}`);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-sm backdrop-blur">
                        AC
                    </div>
                    <div>
                        <Link to={token ? (userRole === 'Admin' ? '/admin' : '/dashboard') : '/login'}>
                            <h1 className="text-lg font-bold tracking-tight text-white">
                                AttendanceClock
                            </h1>
                        </Link>
                        <p className="text-xs text-blue-100">
                            Employee attendance management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {!token ? (
                        <Link
                            to="/login"
                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            Login
                        </Link>
                    ) : (
                        <>
                            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur md:flex">
                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
                                {userRole}
                            </div>

                            {userRole === 'Admin' && (
                                <>
                                    <Link
                                        to="/admin"
                                        className={`${navLinkBase} ${isActive('/admin') ? activeNavLink : inactiveNavLink}`}
                                    >
                                        Admin Dashboard
                                    </Link>
                                    
                                    <Link
                                        to="/all-employees"
                                        className={`${navLinkBase} ${isActive('/all-employees') ? activeNavLink : inactiveNavLink}`}
                                    >
                                        View All Employees
                                    </Link>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Search by Employee Number"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="text-black rounded px-2 py-1"
                                        />
                                        <select
                                            value={selectedEmployee}
                                            onChange={(e) => setSelectedEmployee(e.target.value)}
                                            className="text-black rounded px-2 py-1"
                                        >
                                            <option value="">Select Employee</option>
                                            {filteredEmployees.map((employee) => (
                                                <option key={employee.employeeNumber} value={employee.employeeNumber}>
                                                    {employee.firstName} {employee.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleViewShifts}
                                            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                            disabled={!selectedEmployee}
                                        >
                                            View Shifts
                                        </button>
                                    </div>
                                </>
                            )}

                            {userRole === 'Employee' && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`${navLinkBase} ${isActive('/dashboard') ? activeNavLink : inactiveNavLink}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleViewShifts}
                                        className="hover:underline"
                                    >
                                        Shift History
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;