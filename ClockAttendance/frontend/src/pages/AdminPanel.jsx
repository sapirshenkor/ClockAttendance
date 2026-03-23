import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function AdminPanel() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ firstName: '', lastName: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/admin/AllEmployees');
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiClient.post('/api/admin/CreateEmployees', newEmployee);
      setNewEmployee({ firstName: '', lastName: '', password: '' });
      setSuccessMessage('Employee created successfully.');
      fetchEmployees();
    } catch (err) {
      setError('Failed to create employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (employeeNumber, isActive) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiClient.patch(`/api/admin/employees/${employeeNumber}/status`, { isActive });
      setSuccessMessage('Employee status updated successfully.');
      fetchEmployees();
    } catch (err) {
      setError('Failed to update employee status.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewShifts = (employeeNumber) => {
    navigate(`/shift-history?employeeNumber=${employeeNumber}`);
  };

  const handleViewDetails = (employeeNumber) => {
    navigate(`/employee-details/${employeeNumber}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-lg">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-100">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
          Manage employees, monitor activity, and keep the attendance system organized.
        </p>
      </section>

      {error && <ErrorMessage message={error} />}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Create Employee</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new employee account to the system.
            </p>
          </div>

          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                type="text"
                value={newEmployee.firstName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                type="text"
                value={newEmployee.lastName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, lastName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={newEmployee.password}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Set a secure password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              Create Employee
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Employee List</h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage all registered employees.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              Total employees: {employees.length}
            </div>
          </div>

          {employees.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
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
                    {employees.map((employee) => (
                      <tr key={employee.employeeNumber} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-slate-500">
                            Employee #{employee.employeeNumber}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${employee.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                              }`}
                          >
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  employee.employeeNumber,
                                  !employee.isActive
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 ${employee.isActive
                                  ? 'bg-rose-500 hover:bg-rose-600'
                                  : 'bg-emerald-500 hover:bg-emerald-600'
                                }`}
                            >
                              {employee.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleViewShifts(employee.employeeNumber)}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                            >
                              View Shifts
                            </button>
                            <button
                              onClick={() => handleViewDetails(employee.employeeNumber)}
                              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-700"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-base font-medium text-slate-700">No employees found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Create the first employee using the form on the left.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;