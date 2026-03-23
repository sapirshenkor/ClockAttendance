# Project Context: ClockAttendance

## System Description
ClockAttendance is an Employee Attendance Clock system where employees can clock in and out of shifts. The system ensures accurate attendance tracking and role-based access control for administrators and employees.

## Technology Stack
- ASP.NET Core Web API (.NET 10)
- SQL Server (Docker)
- ASP.NET Identity
- JWT Authentication
- Swagger / OpenAPI
- External Zurich Time API

## Key Constraints
- All attendance timestamps must come from the external Time API.
- Local server time (DateTime.Now / UtcNow) must NOT be used in attendance logic.
- If the Time API fails, the system should return HTTP 503.

## System Roles
- **Admin**: Manages employees and attendance.
- **Employee**: Clocks in and out of shifts.

## Core Domain Entities
- **ApplicationUser**: Represents the identity user.
- **EmployeeProfile**: Stores employee-specific data, including a unique EmployeeNumber generated using a SQL Server Sequence.
- **AttendanceShift**: Tracks clock-in and clock-out times, with `DateOnly` used for date-based queries.
- **AuditLog**: Logs administrative actions.

## Project Structure Overview
- **Controllers**: Handle HTTP requests.
- **Services**: Contain business logic.
- **Models**: Define domain entities.
- **DTOs**: Define data transfer objects.
- **Data**: Includes SQL Server Sequence for EmployeeNumber generation and explicit unique constraints.
- **Infrastructure**: Contains supporting configurations.

## AI Assistance
AI tools were used to assist development, but architectural decisions remain controlled by the developer. The AI respected the system's constraints and followed the developer's instructions.