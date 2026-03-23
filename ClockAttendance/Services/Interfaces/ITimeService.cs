using System;
using System.Threading;
using System.Threading.Tasks;

namespace ClockAttendance.Services.Interfaces
{
    public interface ITimeService
    {
        Task<DateTimeOffset> GetZurichNowAsync(CancellationToken ct);
    }
}