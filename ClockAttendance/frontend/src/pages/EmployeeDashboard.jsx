import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function EmployeeDashboard() {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/api/attendance/status');
                setStatus(response.data);
            } catch (err) {
                setError('Failed to fetch attendance status.');
            } finally {
                setLoading(false);
            }
        };

        const fetchEmployeeDetails = async () => {
            try {
                const response = await apiClient.get('/api/attendance/me');
                setEmployeeDetails(response.data);
            } catch (err) {
                setError('Failed to fetch employee details.');
            }
        };

        fetchStatus();
        fetchEmployeeDetails();
    }, []);

    const handleClockIn = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiClient.post('/api/attendance/clock-in');
            setSuccessMessage('Successfully clocked in.');
            await fetchStatus();
        } catch {
            setError('Failed to clock in.');
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiClient.post('/api/attendance/clock-out');
            setSuccessMessage('Successfully clocked out.');
            await fetchStatus();
        } catch {
            setError('Failed to clock out.');
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const hasOpenShift = status?.hasOpenShift;
    const openShift = status?.openShift;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Employee Dashboard</h1>
                <p className="mt-2 text-blue-100">
                    Manage your attendance and track your current shift
                </p>
            </section>

            {error && <ErrorMessage message={error} />}

            {successMessage && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {successMessage}
                </div>
            )}

            {employeeDetails && (
                <div className="mb-4 rounded-lg bg-blue-100 p-4 text-blue-800">
                    <p className="text-lg font-semibold">
                        Welcome, {employeeDetails.firstName} {employeeDetails.lastName}!
                    </p>
                    <p className="text-sm">Employee Number: {employeeDetails.employeeNumber}</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Attendance Status</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Your current work status in the system
                    </p>

                    <div className="mt-5">
                        <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${hasOpenShift
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                        >
                            {hasOpenShift ? 'Clocked In' : 'Clocked Out'}
                        </span>
                    </div>

                    <div className="mt-6">
                        {hasOpenShift ? (
                            <button
                                onClick={handleClockOut}
                                className="rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-600"
                            >
                                Clock Out
                            </button>
                        ) : (
                            <button
                                onClick={handleClockIn}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Clock In
                            </button>
                        )}
                    </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Current Shift</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Information about your active shift
                    </p>

                    {hasOpenShift && openShift ? (
                        <div className="mt-5 space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Clock In Time</p>
                                <p className="mt-1 font-semibold text-slate-800">
                                    {new Date(openShift.clockInAtZurich).toLocaleString()}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Shift Status</p>
                                <p className="mt-1 font-semibold text-emerald-700">Open</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                            <p className="font-medium text-slate-700">No active shift</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Clock in to start a new shift
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default EmployeeDashboard;