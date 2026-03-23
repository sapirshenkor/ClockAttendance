using ClockAttendance.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ClockAttendance.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeController : ControllerBase
    {
        private readonly ITimeService _timeService;

        public TimeController(ITimeService timeService)
        {
            _timeService = timeService;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentTime()
        {
            try
            {
                var zurichTime = await _timeService.GetZurichNowAsync(HttpContext.RequestAborted);
                return Ok(new { Time = zurichTime });
            }
            catch
            {
                return StatusCode(503, "Unable to fetch time from Time API");
            }
        }
    }
}
