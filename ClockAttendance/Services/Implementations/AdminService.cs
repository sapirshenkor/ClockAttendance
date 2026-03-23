using ClockAttendance.Controllers;
using ClockAttendance.Data;
using ClockAttendance.Exceptions;
using ClockAttendance.Models;
using ClockAttendance.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;


namespace ClockAttendance.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _dbContext;
        private readonly ITimeService _timeService;

        public AdminService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ApplicationDbContext dbContext, ITimeService timeService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _dbContext = dbContext;
            _timeService = timeService;
        }

        private async Task<int> GetNextEmployeeNumberAsync()
        {
            var connection = _dbContext.Database.GetDbConnection();

            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT NEXT VALUE FOR dbo.EmployeeNumbers";

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }
        public async Task<(Guid uniqueId, string userId, int employeeNumber)> CreateEmployeeAsync(string firstName, string lastName, string password)
        {
            // Generate next EmployeeNumber
            var newEmployeeNumber = await GetNextEmployeeNumberAsync();

            // Create Identity user
            var user = new ApplicationUser
            {
                UserName = newEmployeeNumber.ToString(),
                Email = $"employee{newEmployeeNumber}@example.com",
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to create user: " + string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, "Employee");

            // Get Zurich time
            var createdAtZurich = await _timeService.GetZurichNowAsync(default);

            // Create EmployeeProfile
            var profile = new EmployeeProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                EmployeeNumber = newEmployeeNumber,
                FirstName = firstName,
                LastName = lastName,
                IsActive = true,
                CreatedAtZurich = createdAtZurich
            };

            _dbContext.EmployeeProfiles.Add(profile);
            await _dbContext.SaveChangesAsync();

            return (profile.Id, user.Id, newEmployeeNumber);
        }

        public async Task<IEnumerable<EmployeeProfile>> ListEmployeesAsync()
        {
            return await _dbContext.EmployeeProfiles.ToListAsync();
        }

        public async Task ActivateDeactivateEmployeeAsync(int employeeNumber, bool isActive)
        {
            var profile = await _dbContext.EmployeeProfiles
                .FirstOrDefaultAsync(e => e.EmployeeNumber == employeeNumber);

            if (profile == null)
            {
                throw new Exception("Employee not found");
            }

            profile.IsActive = isActive;
            await _dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<AttendanceShift>> GetAttendanceByEmployeeAsync(int employeeNumber, DateOnly from, DateOnly to)
        {
            var profile = await _dbContext.EmployeeProfiles.FirstOrDefaultAsync(e => e.EmployeeNumber == employeeNumber);
            if (profile == null)
            {
                throw new Exception("Employee not found");
            }

            var userId = profile.UserId;

            var fromDate = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var toDate = new DateTimeOffset(to.ToDateTime(TimeOnly.MaxValue), TimeSpan.Zero);

            return await _dbContext.AttendanceShifts
                .Where(s => s.UserId == userId &&
                            s.ClockInAtZurich >= fromDate &&
                            s.ClockInAtZurich <= toDate)
                .ToListAsync();
        }

        public async Task CloseOpenShiftAsync(Guid shiftId, string adminUserId)
        {
            var shift = await _dbContext.AttendanceShifts
                .FirstOrDefaultAsync(s => s.Id == shiftId);

            if (shift == null || shift.ClockOutAtZurich != null)
            {
                throw new Exception("Shift not found or already closed");
            }

            var closedAtZurich = await _timeService.GetZurichNowAsync(default);

            shift.ClockOutAtZurich = closedAtZurich;
            shift.ClosedByAdminUserId = adminUserId;
            shift.Status = ShiftStatus.Closed;
            shift.UpdatedAtZurich = closedAtZurich;

            await _dbContext.SaveChangesAsync();
        }

        public async Task EditShiftAsync(
            Guid shiftId,
            DateTimeOffset? clockInAtZurich,
            DateTimeOffset? clockOutAtZurich,
            string reason,
            string adminUserId)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new Exception("Reason is required");
            }

            var shift = await _dbContext.AttendanceShifts
                .FirstOrDefaultAsync(s => s.Id == shiftId);

            if (shift == null)
            {
                throw new Exception("Shift not found");
            }

            var effectiveClockIn = clockInAtZurich ?? shift.ClockInAtZurich;
            var effectiveClockOut = clockOutAtZurich ?? shift.ClockOutAtZurich;

            if (effectiveClockOut.HasValue && effectiveClockOut.Value < effectiveClockIn)
            {
                throw new Exception("Clock-out time cannot be earlier than clock-in time");
            }

            shift.ClockInAtZurich = effectiveClockIn;
            shift.ClockOutAtZurich = effectiveClockOut;
            shift.LastEditedByAdminUserId = adminUserId;
            shift.LastEditReason = reason;
            shift.UpdatedAtZurich = await _timeService.GetZurichNowAsync(default);

            shift.Status = shift.ClockOutAtZurich.HasValue
                ? ShiftStatus.Closed
                : ShiftStatus.Open;

            await _dbContext.SaveChangesAsync();
        }

        public async Task<EmployeeProfile> GetEmployeeByNumberAsync(int employeeNumber)
        {
            return await _dbContext.EmployeeProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmployeeNumber == employeeNumber);
        }

        public async Task UpdateEmployeeAsync(int employeeNumber, UpdateEmployeeRequest request)
        {
            var existingEmployee = await _dbContext.EmployeeProfiles
                .FirstOrDefaultAsync(e => e.EmployeeNumber == employeeNumber);

            if (existingEmployee == null)
            {
                throw new NotFoundException($"Employee with number {employeeNumber} not found.");
            }

            existingEmployee.FirstName = request.FirstName;
            existingEmployee.LastName = request.LastName;
            existingEmployee.IsActive = request.IsActive;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var user = await _userManager.FindByIdAsync(existingEmployee.UserId);
                if (user != null)
                {
                    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var result = await _userManager.ResetPasswordAsync(user, resetToken, request.Password);

                    if (!result.Succeeded)
                    {
                        throw new Exception("Failed to update password: " + string.Join(", ", result.Errors));
                    }
                }
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}