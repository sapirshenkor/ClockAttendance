using ClockAttendance.Exceptions;
using ClockAttendance.Models;
using ClockAttendance.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ClockAttendance.Controllers
{
    [ApiController]
    [Route("api/attendance")]
    [Authorize(Roles = "Employee")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var status = await _attendanceService.GetStatusAsync(userId);
            return Ok(status);
        }

        [HttpPost("clock-in")]
        public async Task<IActionResult> ClockIn()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            try
            {
                await _attendanceService.ClockInAsync(userId);
                return NoContent();
            }
            catch (ConflictException ex)
            {
                return Conflict(new { error = "Conflict", message = ex.Message });
            }
            catch (ServiceUnavailableException ex)
            {
                return StatusCode(503, new { error = "Service Unavailable", message = ex.Message });
            }
        }

        [HttpPost("clock-out")]
        public async Task<IActionResult> ClockOut()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            try
            {
                await _attendanceService.ClockOutAsync(userId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (ServiceUnavailableException ex)
            {
                return StatusCode(503, new { error = "Service Unavailable", message = ex.Message });
            }
        }

        [HttpGet("shifts")]
        public async Task<IActionResult> GetHistory([FromQuery] DateOnly from, [FromQuery] DateOnly to)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var history = await _attendanceService.GetHistoryAsync(userId, from, to);
            return Ok(history);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var profile = await _attendanceService.GetEmployeeProfileByUserIdAsync(userId);
            if (profile == null)
            {
                return NotFound(new { error = "Employee profile not found." });
            }

            return Ok(profile);
        }
    }
}