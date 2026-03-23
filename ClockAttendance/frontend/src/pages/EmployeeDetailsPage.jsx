import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EmployeeDetailsPage = () => {
  const { employeeNumber } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedEmployee, setUpdatedEmployee] = useState({
    firstName: '',
    lastName: '',
    isActive: true,
    password: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await apiClient.get(`/api/admin/employees/${employeeNumber}`);
        setEmployee(response.data);
        setUpdatedEmployee({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isActive: response.data.isActive,
          password: '' // Password is not fetched for security reasons
        });
      } catch (err) {
        setError('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeNumber]);

  const handleSaveChanges = async () => {
    try {
      await apiClient.put(`/api/admin/employees/${employeeNumber}`, updatedEmployee);
      setEmployee({ ...employee, ...updatedEmployee });
      setEditMode(false);
    } catch (err) {
      setError('Failed to update employee details.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Details</h1>
      {editMode ? (
        <div>
          <label className="block mb-2">
            First Name:
            <input
              type="text"
              value={updatedEmployee.firstName}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, firstName: e.target.value })}
              className="block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label className="block mb-2">
            Last Name:
            <input
              type="text"
              value={updatedEmployee.lastName}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, lastName: e.target.value })}
              className="block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label className="block mb-2">
            Status:
            <select
              value={updatedEmployee.isActive}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, isActive: e.target.value === 'true' })}
              className="block w-full p-2 border border-gray-300 rounded"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="block mb-2">
            Password:
            <input
              type="password"
              value={updatedEmployee.password}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, password: e.target.value })}
              className="block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <button
            onClick={handleSaveChanges}
            className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p><strong>Employee Number:</strong> {employee.employeeNumber}</p>
          <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
          <p><strong>Status:</strong> {employee.isActive ? 'Active' : 'Inactive'}</p>
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailsPage;