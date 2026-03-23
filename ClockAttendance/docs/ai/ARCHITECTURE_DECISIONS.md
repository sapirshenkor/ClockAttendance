# Architecture Decisions: ClockAttendance

## Identifiers
- **Admin operations**: Use `EmployeeNumber` instead of Identity `UserId`.
- **Employee self-operations**: Rely on JWT claims for user identification.

## Time Handling
- Attendance timestamps come only from the external Zurich Time API.
- Local server time (DateTime.Now / UtcNow) is not allowed for attendance logic.

## EmployeeNumber Generation
- EmployeeNumber values are generated using a SQL Server Sequence.
- This ensures concurrency-safe unique identifiers.

## Attendance Logic
- Only one open shift per employee is allowed.
- Database constraints enforce this rule.

## API Structure
- Controllers remain thin.
- Business logic resides in Services.

---

## Implementation Notes

### Implementation Adjustment — EmployeeNumber Generation
**Originally planned**: MAX(EmployeeNumber) + 1

**Final implementation**: SQL Server Sequence used to generate employee numbers safely under concurrency.

### Implementation Adjustment — User Identification
**Originally planned**: Use `Name` claim for identifying users.

**Final implementation**: Use `NameIdentifier` claim for better alignment with ASP.NET Identity.

### Implementation Adjustment — Attendance Queries
**Originally planned**: Use `DateTime` for attendance queries.

**Final implementation**: Use `DateOnly` for better date-based filtering in reporting APIs.

### Implementation Adjustment — Database Constraints
**Originally planned**: Implicit constraints for unique EmployeeNumber.

**Final implementation**: Explicit unique index added to `EmployeeProfile.EmployeeNumber`.