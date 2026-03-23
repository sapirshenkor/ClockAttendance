using ClockAttendance.Exceptions;
using ClockAttendance.Models;
using ClockAttendance.Services.Implementations;
using ClockAttendance.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;


namespace ClockAttendance.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("CreateEmployees")]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
        {
            var result = await _adminService.CreateEmployeeAsync(request.FirstName, request.LastName, request.Password);
            return Ok(result);
        }

        [HttpGet("AllEmployees")]
        public async Task<IActionResult> ListEmployees()
        {
            var employees = await _adminService.ListEmployeesAsync();
            return Ok(employees);
        }


        [HttpPatch("employees/{employeeNumber}/status")]
        public async Task<IActionResult> ActivateDeactivateEmployee(int employeeNumber, [FromBody] ActivateDeactivateRequest request)
        {
            await _adminService.ActivateDeactivateEmployeeAsync(employeeNumber, request.IsActive);
            return NoContent();
        }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendanceByEmployee(
            [FromQuery] int employeeNumber,
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to)
        {
            var attendance = await _adminService.GetAttendanceByEmployeeAsync(employeeNumber, from, to);
            return Ok(attendance);
        }

        [HttpPost("attendance/{shiftId}/close")]
        public async Task<IActionResult> CloseOpenShift(Guid shiftId)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized();
            }

            await _adminService.CloseOpenShiftAsync(shiftId, adminUserId);
            return NoContent();
        }

        [HttpPut("attendance/{shiftId}")]
        public async Task<IActionResult> EditShift(Guid shiftId, [FromBody] EditShiftRequest request)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized();
            }

            await _adminService.EditShiftAsync(
                shiftId,
                request.ClockInAtZurich,
                request.ClockOutAtZurich,
                request.Reason,
                adminUserId);

            return NoContent();
        }

        [HttpGet("employees/{employeeNumber}")]
        public async Task<IActionResult> GetEmployeeByNumber(int employeeNumber)
        {
            try
            {
                var employee = await _adminService.GetEmployeeByNumberAsync(employeeNumber);
                if (employee == null)
                {
                    return NotFound(new { error = "Employee not found." });
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while fetching the employee details.", details = ex.Message });
            }
        }

        [HttpPut("employees/{employeeNumber}")]
        public async Task<IActionResult> UpdateEmployee(int employeeNumber, [FromBody] UpdateEmployeeRequest request)
        {
            try
            {
                await _adminService.UpdateEmployeeAsync(employeeNumber, request);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the employee details.", details = ex.Message });
            }
        }
    }

    public class CreateEmployeeRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
    }

    public class ActivateDeactivateRequest
    {
        public bool IsActive { get; set; }
    }

    public class EditShiftRequest
    {
        public DateTimeOffset? ClockInAtZurich { get; set; }
        public DateTimeOffset? ClockOutAtZurich { get; set; }
        public string Reason { get; set; }
    }

    public class UpdateEmployeeRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; }
        public string Password { get; set; }
    }
}