using ClockAttendance.Data;
using ClockAttendance.Exceptions;
using ClockAttendance.Models;
using ClockAttendance.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClockAttendance.Services.Implementations; // Add namespace for TimeApiException

namespace ClockAttendance.Services.Implementations
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ITimeService _timeService;

        public AttendanceService(ApplicationDbContext dbContext, ITimeService timeService)
        {
            _dbContext = dbContext;
            _timeService = timeService;
        }

        public async Task<AttendanceStatusResponse> GetStatusAsync(string userId)
        {
            var openShift = await _dbContext.AttendanceShifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ClockOutAtZurich == null);

            return new AttendanceStatusResponse
            {
                HasOpenShift = openShift != null,
                OpenShift = openShift
            };
        }

        public async Task ClockInAsync(string userId)
        {
            var hasOpenShift = await _dbContext.AttendanceShifts
                .AnyAsync(s => s.UserId == userId && s.ClockOutAtZurich == null);

            if (hasOpenShift)
            {
                throw new ConflictException("Cannot clock in while an open shift exists.");
            }

            try
            {
                var clockInTime = await _timeService.GetZurichNowAsync(default);

                var newShift = new AttendanceShift
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    ClockInAtZurich = clockInTime,
                    Status = ShiftStatus.Open,
                    CreatedAtZurich = clockInTime,
                    UpdatedAtZurich = clockInTime
                };

                _dbContext.AttendanceShifts.Add(newShift);
                await _dbContext.SaveChangesAsync();
            }
            catch (TimeApiException ex)
            {
                throw new ServiceUnavailableException("Unable to fetch Zurich time.", ex);
            }
        }

        public async Task ClockOutAsync(string userId)
        {
            var openShift = await _dbContext.AttendanceShifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ClockOutAtZurich == null);

            if (openShift == null)
            {
                throw new NotFoundException("No open shift to clock out.");
            }

            try
            {
                var clockOutTime = await _timeService.GetZurichNowAsync(default);

                openShift.ClockOutAtZurich = clockOutTime;
                openShift.Status = ShiftStatus.Closed;
                openShift.UpdatedAtZurich = clockOutTime;

                await _dbContext.SaveChangesAsync();
            }
            catch (TimeApiException ex) // Use fully qualified name
            {
                throw new ServiceUnavailableException("Unable to fetch Zurich time.", ex);
            }
        }

        public async Task<IEnumerable<AttendanceShift>> GetHistoryAsync(string userId, DateOnly from, DateOnly to)
        {
            var fromDate = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var toDate = new DateTimeOffset(to.ToDateTime(TimeOnly.MaxValue), TimeSpan.Zero);

            return await _dbContext.AttendanceShifts
                .Where(s => s.UserId == userId &&
                            s.ClockInAtZurich >= fromDate &&
                            s.ClockInAtZurich <= toDate)
                .ToListAsync();
        }

        public async Task<EmployeeProfile> GetEmployeeProfileByUserIdAsync(string userId)
        {
            return await _dbContext.EmployeeProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }
    }
}