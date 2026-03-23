import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';

function ShiftHistory() {
    const [shifts, setShifts] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [error, setError] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [editingShift, setEditingShift] = useState(null); // Define editingShift state
    const [editForm, setEditForm] = useState({
        clockInAtZurich: '',
        clockOutAtZurich: '',
        reason: ''
    });

    const [searchParams] = useSearchParams();
    const employeeNumber = searchParams.get('employeeNumber');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchShifts();
        fetchEmployeeDetails();
    }, []);

    const fetchShifts = async () => {
        try {
            setError(null);

            const endpoint =
                userRole === 'Admin' ? '/api/admin/attendance' : '/api/attendance/shifts';

            const params =
                userRole === 'Admin'
                    ? { employeeNumber, from: fromDate || undefined, to: toDate || undefined }
                    : { from: fromDate || undefined, to: toDate || undefined };

            const response = await apiClient.get(endpoint, { params });
            setShifts(response.data);
        } catch (err) {
            setError('Failed to fetch shift history.');
        }
    };

    const fetchEmployeeDetails = async () => {
        try {
            let response;
            if (userRole === 'Admin') {
                response = await apiClient.get(`/api/admin/employees/${employeeNumber}`);
            } else {
                response = await apiClient.get('/api/attendance/me');
            }
            setEmployeeDetails(response.data);
        } catch (err) {
            setError('Failed to fetch employee details.');
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchShifts();
    };

    const handleEditShift = async (shiftId) => {
        try {
            await apiClient.put(`/api/admin/attendance/${shiftId}`, editForm);
            setEditingShift(null);
            fetchShifts();
        } catch (err) {
            setError('Failed to edit shift.');
        }
    };

    const openEditForm = (shift) => {
        setEditingShift(shift.id);
        setEditForm({
            clockInAtZurich: shift.clockInAtZurich || '',
            clockOutAtZurich: shift.clockOutAtZurich || '',
            reason: ''
        });
    };

    const closeEditForm = () => {
        setEditingShift(null);
        setEditForm({ clockInAtZurich: '', clockOutAtZurich: '', reason: '' });
    };

    const getShiftStatusInfo = (status) => {
        if (typeof status === 'string') {
            const normalized = status.toLowerCase();
            return {
                label: status,
                isOpen: normalized === 'open',
            };
        }

        if (typeof status === 'number') {
            return {
                label: status === 0 ? 'Open' : 'Closed',
                isOpen: status === 0,
            };
        }

        return {
            label: 'Unknown',
            isOpen: false,
        };
    };

    return (
        <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                            Attendance Records
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-800">Shift History</h1>
                        {employeeDetails && (
                            <div className="mt-2">
                                <p className="text-lg font-semibold">Employee: {employeeDetails.firstName} {employeeDetails.lastName}</p>
                                <p className="text-sm text-gray-700">Employee Number: {employeeDetails.employeeNumber}</p>
                            </div>
                        )}
                        <p className="mt-2 text-sm text-slate-500">
                            Review recorded shifts and filter by date range.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        Role: {userRole}
                    </div>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                </div>
            )}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Filter Shifts</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Select a date range to narrow the results.
                </p>

                <form
                    onSubmit={handleFilter}
                    className="mt-5 grid gap-4 md:grid-cols-[1fr,1fr,auto]"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            From
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            To
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
                        >
                            Apply Filter
                        </button>
                    </div>
                </form>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Recorded Shifts</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Total results: {shifts.length}
                        </p>
                    </div>
                </div>

                {shifts.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Clock In
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Clock Out
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {shifts.map((shift) => {
                                        const statusInfo = getShiftStatusInfo(shift.status);

                                        return (
                                            <tr key={shift.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 text-sm text-slate-700">
                                                    {new Date(shift.clockInAtZurich).toLocaleString()}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-700">
                                                    {shift.clockOutAtZurich
                                                        ? new Date(shift.clockOutAtZurich).toLocaleString()
                                                        : 'N/A'}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.isOpen
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                            }`}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    {userRole === 'Admin' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditForm(shift)}
                                                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() => handleCloseShift(shift.id)}
                                                                className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <p className="text-base font-medium text-slate-700">No shifts found.</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Try selecting a different date range.
                        </p>
                    </div>
                )}
            </section>

            {editingShift && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Edit Shift</h2>
                        <label className="block mb-2">
                            Clock In:
                            <input
                                type="datetime-local"
                                value={editForm.clockInAtZurich}
                                onChange={(e) => setEditForm({ ...editForm, clockInAtZurich: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Clock Out:
                            <input
                                type="datetime-local"
                                value={editForm.clockOutAtZurich}
                                onChange={(e) => setEditForm({ ...editForm, clockOutAtZurich: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            Reason:
                            <textarea
                                value={editForm.reason}
                                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                className="block w-full p-2 border border-gray-300 rounded"
                            />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleEditShift(editingShift)}
                                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={closeEditForm}
                                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShiftHistory;