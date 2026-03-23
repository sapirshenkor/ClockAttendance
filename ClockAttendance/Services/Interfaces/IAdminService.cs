using ClockAttendance.Controllers;
using ClockAttendance.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClockAttendance.Services.Interfaces
{
    public interface IAdminService
    {
        Task<(Guid uniqueId, string userId, int employeeNumber)> CreateEmployeeAsync(string firstName, string lastName, string password);
        Task<IEnumerable<EmployeeProfile>> ListEmployeesAsync();
        Task ActivateDeactivateEmployeeAsync(int employeeNumber, bool isActive);
        Task<IEnumerable<AttendanceShift>> GetAttendanceByEmployeeAsync(int employeeNumber, DateOnly from, DateOnly to);
        Task CloseOpenShiftAsync(Guid shiftId, string adminUserId);
        Task EditShiftAsync(Guid shiftId, DateTimeOffset? clockInAtZurich, DateTimeOffset? clockOutAtZurich, string reason, string adminUserId);
        Task<EmployeeProfile> GetEmployeeByNumberAsync(int employeeNumber);
        Task UpdateEmployeeAsync(int employeeNumber, UpdateEmployeeRequest request);
    }
}