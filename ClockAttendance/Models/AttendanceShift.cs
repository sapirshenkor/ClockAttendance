using System;

namespace ClockAttendance.Models
{
    public class AttendanceShift
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } // FK to ApplicationUser
        public DateTimeOffset ClockInAtZurich { get; set; } // Not null
        public DateTimeOffset? ClockOutAtZurich { get; set; } // Nullable
        public ShiftStatus Status { get; set; } // Enum: Open, Closed
        public string? Notes { get; set; } // Optional
        public DateTimeOffset CreatedAtZurich { get; set; }
        public DateTimeOffset UpdatedAtZurich { get; set; }
        public string? ClosedByAdminUserId { get; set; } // Nullable FK
        public string? LastEditedByAdminUserId { get; set; } // Nullable FK
        public string? LastEditReason { get; set; } // Required for edits
    }

    public enum ShiftStatus
    {
        Open,
        Closed
    }
}