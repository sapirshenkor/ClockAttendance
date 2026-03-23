using ClockAttendance.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClockAttendance.Services.Interfaces
{
    public interface IAttendanceService
    {
        Task<AttendanceStatusResponse> GetStatusAsync(string userId);
        Task ClockInAsync(string userId);
        Task ClockOutAsync(string userId);
        Task<IEnumerable<AttendanceShift>> GetHistoryAsync(string userId, DateOnly from, DateOnly to);
        Task<EmployeeProfile> GetEmployeeProfileByUserIdAsync(string userId);
    }

    public class AttendanceStatusResponse
    {
        public bool HasOpenShift { get; set; }
        public AttendanceShift? OpenShift { get; set; }
    }
}