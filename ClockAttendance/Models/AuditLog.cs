using System;

namespace ClockAttendance.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public string ActorUserId { get; set; } // FK to ApplicationUser
        public string Action { get; set; }
        public string TargetUserId { get; set; } // Nullable FK
        public Guid? TargetShiftId { get; set; } // Nullable FK
        public string Reason { get; set; } // Optional
        public string PayloadJson { get; set; } // Optional
        public DateTimeOffset OccurredAtZurich { get; set; }
    }
}