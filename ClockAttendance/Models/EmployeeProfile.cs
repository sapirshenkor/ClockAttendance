using System;

namespace ClockAttendance.Models
{
    public class EmployeeProfile
    {
        public Guid Id { get; set; } // Unique domain ID
        public string UserId { get; set; } // FK to ApplicationUser
        public int EmployeeNumber { get; set; } // Unique
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAtZurich { get; set; }
    }
}