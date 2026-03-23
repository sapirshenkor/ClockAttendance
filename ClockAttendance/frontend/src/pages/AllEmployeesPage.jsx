import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AllEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get('/api/admin/AllEmployees');
        setEmployees(response.data);
      } catch (err) {
        setError('Failed to fetch employees.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Employees</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Employee Number</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employeeNumber}>
              <td className="border border-gray-300 px-4 py-2">{employee.employeeNumber}</td>
              <td className="border border-gray-300 px-4 py-2">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {employee.isActive ? 'Active' : 'Inactive'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => window.location.href = `/employee-details/${employee.employeeNumber}`}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllEmployeesPage;