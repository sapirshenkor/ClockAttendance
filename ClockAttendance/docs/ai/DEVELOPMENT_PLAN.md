# Development Plan: AttendanceClock

## Introduction
The AttendanceClock system was initially scaffolded using an AI-guided development prompt. This prompt defined the architecture, constraints, and phased implementation plan for the system.

## Original Development Prompt
You are a senior .NET architect and backend engineer.  
We are building an Employee Attendance Clock system.  

### Important Constraints:
- Backend: ASP.NET Core Web API (.NET 10)
- Database: SQL Server (Docker)
- Authentication: ASP.NET Identity + JWT
- Roles: Admin, Employee
- Single Web API project (no multi-project solution)
- Every ClockIn / ClockOut timestamp MUST come from external Time API (Europe/Zurich).
- Absolutely forbidden: DateTime.Now / DateTime.UtcNow / DateTimeOffset.Now in business logic.
- No fallback to local time. If Time API fails -> return 503.

### Project Structure:

You are a senior .NET architect and backend engineer.
We are building an Employee Attendance Clock system.
Important constraints:
•	Backend: ASP.NET Core Web API (.NET 10)
•	Database: SQL Server (Docker)
•	Authentication: ASP.NET Identity + JWT
•	Roles: Admin, Employee
•	Single Web API project (no multi-project solution)
•	Every ClockIn / ClockOut timestamp MUST come from external Time API (Europe/Zurich).
•	Absolutely forbidden: DateTime.Now / DateTime.UtcNow / DateTimeOffset.Now in business logic.
•	No fallback to local time. If Time API fails -> return 503.
We will implement everything in ONE Web API project with clean folder structure.
=====================================
PROJECT STRUCTURE (Single Project)
ClockAttendance.Api │ ├── Controllers │   ├── AuthController.cs │   ├── AdminController.cs │   ├── AttendanceController.cs │ ├── Data │   ├── AppDbContext.cs │   ├── EntityConfigurations/ │ ├── Models │   ├── ApplicationUser.cs │   ├── EmployeeProfile.cs │   ├── AttendanceShift.cs │   ├── AuditLog.cs │   ├── Enums/ │ ├── DTOs │   ├── Requests/ │   ├── Responses/ │ ├── Services │   ├── Interfaces/ │   │     ├── ITimeService.cs │   │     ├── IAttendanceService.cs │   │     ├── IAdminService.cs │   ├── Implementations/ │   │     ├── TimeApiIoTimeService.cs │   │     ├── AttendanceService.cs │   │     ├── AdminService.cs │ ├── Infrastructure │   ├── SeedData.cs │   ├── JwtSettings.cs │ ├── Migrations │ ├── Program.cs └── appsettings.json
=====================================
## PHASE 0 — Setup & Docker
=====================================
1.	Create ASP.NET Core Web API (.NET 10).
2.	Add packages:
•	Microsoft.EntityFrameworkCore.SqlServer
•	Microsoft.EntityFrameworkCore.Tools
•	Microsoft.AspNetCore.Identity.EntityFrameworkCore
•	Microsoft.AspNetCore.Authentication.JwtBearer
•	Swashbuckle.AspNetCore
•	Polly (optional but recommended)
3.	Create docker-compose.yml:
•	SQL Server image
•	SA_PASSWORD
•	ACCEPT_EULA=Y
•	expose 1433
•	persistent volume
4.	Configure appsettings:
•	ConnectionStrings: DefaultConnection
•	Jwt: Key, Issuer, Audience, ExpirationMinutes
•	SeedAdmin: EmployeeNumber, Password, FirstName, LastName

=====================================
## PHASE 1 — Identity + JWT + Roles + Seed Admin
=====================================
1.	Create ApplicationUser : IdentityUser.
2.	Configure AppDbContext : IdentityDbContext<ApplicationUser>.
3.	Configure Identity:
•	reasonable password rules
•	lockout optional
4.	Configure JWT authentication:
•	AddAuthentication().AddJwtBearer()
•	configure Issuer, Audience, Key
5.	Seed roles:
•	Admin
•	Employee
6.	Seed Admin user on startup (dev only):
•	Username = EmployeeNumber
•	Assign Admin role
•	Create EmployeeProfile for Admin as well
•	CreatedAtZurich must come from ITimeService (use service inside seeding carefully)
Verify:
•	Login endpoint returns JWT
•	Swagger Authorize works

=====================================
## PHASE 2 — Domain Models & Database
=====================================
Create models:
1.	EmployeeProfile
•	Id (Guid)  <-- Unique domain ID
•	UserId (string) UNIQUE
•	EmployeeNumber (int) UNIQUE
•	FirstName
•	LastName
•	IsActive
•	CreatedAtZurich (DateTimeOffset)
2.	AttendanceShift
•	Id (Guid)
•	UserId (string)
•	ClockInAtZurich (DateTimeOffset) NOT NULL
•	ClockOutAtZurich (DateTimeOffset?) NULL
•	Status (enum: Open, Closed)
•	Notes (string?)
•	CreatedAtZurich
•	UpdatedAtZurich
•	ClosedByAdminUserId (string?)
•	LastEditedByAdminUserId (string?)
•	LastEditReason (string?)
3.	AuditLog
•	Id (Guid)
•	ActorUserId
•	Action
•	TargetUserId
•	TargetShiftId
•	Reason
•	PayloadJson
•	OccurredAtZurich
DB RULES:
•	EmployeeNumber UNIQUE
•	EmployeeProfile.UserId UNIQUE
•	Unique filtered index: Only one open shift per user: UNIQUE (UserId) WHERE ClockOutAtZurich IS NULL
Create migration and update database.

=====================================
## PHASE 3 — External Time Service
=====================================
Create ITimeService:
•	Task<DateTimeOffset> GetZurichNowAsync(CancellationToken ct)
Implement TimeApiIoTimeService:
•	HttpClientFactory
•	Endpoint: https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Zurich
•	Add timeout (3-5 seconds)
•	Optional retry (2 attempts)
•	Log latency
•	If fails -> throw custom exception mapped to HTTP 503
Important: NO DateTime.Now anywhere in attendance logic.

=====================================
## PHASE 4 — Admin Logic (BUILD FIRST)
=====================================

Create IAdminService and AdminService.
Admin endpoints (Role: Admin):
1.	Create Employee POST /api/admin/employees Body: { firstName, lastName, password }
Process:
•	Generate next EmployeeNumber safely (handle concurrency)
•	Create Identity user: username = employeeNumber.ToString()
•	Assign Employee role
•	Get Zurich time
•	Create EmployeeProfile with CreatedAtZurich
•	Add AuditLog CREATE_EMPLOYEE
Return:
•	employeeNumber
•	uniqueId (Guid)
•	userId
2.	List Employees GET /api/admin/employees
3.	Activate/Deactivate Employee PATCH /api/admin/employees/{userId}/status
4.	Get Attendance By Employee GET /api/admin/attendance?userId=&from=&to=
5.	Close Open Shift POST /api/admin/attendance/{shiftId}/close
•	Ensure shift is open
•	Get Zurich time
•	Set ClockOutAtZurich
•	Set ClosedByAdminUserId
•	Add AuditLog ADMIN_CLOSE_SHIFT
6.	Edit Shift PUT /api/admin/attendance/{shiftId}
Body: { clockInAtZurich?, clockOutAtZurich?, reason (required) }
Rules:
•	reason required
•	if both times exist -> out >= in
•	Add AuditLog ADMIN_EDIT_SHIFT
•	UpdatedAtZurich must come from Time API

=====================================
## PHASE 5 — Employee Logic
=====================================

Create IAttendanceService and AttendanceService.
Endpoints (Role: Employee):
1.	Status GET /api/attendance/status
2.	Clock In POST /api/attendance/clock-in
•	If open shift exists -> 409
•	Get Zurich time
•	Create new AttendanceShift (Open)
3.	Clock Out POST /api/attendance/clock-out
•	If no open shift -> 409
•	Get Zurich time
•	Close shift
4.	History GET /api/attendance/shifts?from=&to=
Enforce DB unique open shift constraint.

=====================================
## PHASE 6 — Validation & Error Handling
=====================================

•	Consistent error response: { error, message, details }
•	Map TimeService exception -> 503
•	Map unique constraint violation -> 409
=====================================
PHASE 7 — Testing Checklist Before Frontend
•	Create employee as admin
•	Login as employee
•	ClockIn
•	Try ClockIn again -> 409
•	ClockOut
•	Admin edit shift (with reason)
•	Admin close shift
•	Time API failure -> 503
Only after all green -> move to React.

=====================================
## PHASE 8 — React Frontend
=====================================

Start the frontend only after the backend is fully verified using Swagger and all API endpoints are working correctly.

The frontend will be implemented using **React** and will communicate with the backend exclusively through the REST API.

### General Architecture

The frontend is a **separate React application** that consumes the ASP.NET Core Web API.

Communication flow:

React UI  
↓  
HTTP Requests (fetch / axios)  
↓  
ASP.NET Core Web API  
↓  
Services → Database

The backend returns **JSON responses**, and React is responsible for rendering the UI based on that data.

### Authentication

Authentication is handled using **JWT tokens**.

Flow:

1. User logs in via `/api/auth/login`.
2. The backend returns a JWT token.
3. The frontend stores the token (memory or localStorage).
4. All subsequent API requests must include:


### Frontend Features

The React application should include the following pages:

**Login**
- Employee/Admin login
- Store JWT token

**Employee Dashboard**
- Show current attendance status
- Clock In button
- Clock Out button

**Shift History**
- List previous shifts
- Filter by date range (if implemented)

**Admin Panel**
- List employees
- Create employee
- Activate / deactivate employee
- View employee attendance
- Edit shift (with reason)
- Close open shift

### Important Rules

The frontend must follow these constraints:

- The frontend **must never generate timestamps**.
- All time values must come from the backend API.
- Business logic must remain in the backend services.
- The frontend should only handle:
  - UI rendering
  - user interaction
  - API calls
  - state management

### Suggested React Structure

Example project structure:

src
├─ api
│ ├─ authApi.js
│ ├─ attendanceApi.js
│ └─ adminApi.js
│
├─ pages
│ ├─ LoginPage.jsx
│ ├─ EmployeeDashboard.jsx
│ └─ AdminPanel.jsx
│
├─ components
│ ├─ ClockButtons.jsx
│ └─ ShiftHistory.jsx
│
├─ context
│ └─ AuthContext.jsx
│
├─ App.jsx
└─ main.jsx


### Development Order

Implement the frontend in the following order:

1. Login page
2. JWT handling
3. Employee dashboard
4. Clock in / clock out
5. Shift history
6. Admin panel

The frontend should remain lightweight and focused on consuming the API.

=====================================
PHASE 9 — Frontend UX/UI Refinement
=====================================

After the minimal React frontend is functional, improve the user experience and visual structure of the application.

The goal of this phase is not to redesign the system from scratch, but to make the frontend feel clearer, more polished, and more professional for a Home Assignment submission.

### Goals

Improve the frontend with:

- Clear navigation
- Better layout structure
- Token-aware authentication flow
- More polished dashboards for Employee and Admin
- Better user feedback for loading, errors, and success states

### Navigation

Add a simple and clear navigation structure.

Suggested navigation behavior:

- Unauthenticated users:
  - Login

- Authenticated Employee users:
  - Dashboard
  - Shift History
  - Logout

- Authenticated Admin users:
  - Admin Dashboard
  - Employees
  - Attendance Reports
  - Logout

A top navigation bar or side navigation may be used, as long as it remains simple and clear.

### Authentication UX

Improve token handling and session flow.

Frontend should support:

- Store JWT token after login
- Restore authenticated session on refresh (if localStorage is used)
- Logout action that clears token and resets auth state
- Redirect unauthenticated users away from protected pages
- Redirect users to the correct dashboard based on role

### Dashboard Improvements

#### Employee Dashboard
Should present:
- Current attendance status
- Primary Clock In / Clock Out actions
- Clear current shift information
- Quick access to shift history

#### Admin Dashboard
Should present:
- Quick navigation to employee management
- Access to attendance reports
- Access to shift editing/closing actions
- Clear management-oriented layout

### UI/UX Improvements

Add lightweight styling improvements such as:

- Consistent spacing and layout
- Clear section headers
- Card-based containers where useful
- Better button hierarchy
- Loading states
- Error and success messages
- Empty-state messages where no data exists

The design should remain lightweight and appropriate for a Home Assignment project.

### Component Refinement

Refactor the frontend where needed into reusable UI components such as:

- Navbar
- ProtectedRoute
- PageLayout
- StatusCard
- ErrorMessage
- LoadingSpinner

Do not over-engineer the frontend.

### Important Rules

- Do not move business logic from backend to frontend
- Do not generate timestamps in the frontend
- Do not introduce unnecessary complexity
- Keep the frontend simple, readable, and professional

### Suggested Implementation Order

1. Add navigation bar / layout shell
2. Add authentication-aware routing
3. Add logout flow
4. Improve Employee Dashboard layout
5. Improve Admin Dashboard layout
6. Add common feedback components
7. Polish styling and page consistency

=====================================
PHASE 10 — UI/UX Professionalization (Frontend Refinement)
=====================================

Goal:
Transform the minimal functional React frontend into a clean, modern, and professional UI suitable for a Home Assignment submission.

Scope:
- No changes to backend logic
- No changes to API contracts
- No business logic duplication in frontend

Improvements:
- Landing page with visual identity
- Responsive and role-based navigation bar
- Protected routing with proper redirection
- Styled login experience
- Employee dashboard redesign
- Admin dashboard redesign
- Reusable UI components (Card, Button, Input, Layout)
- Loading states, error states, success feedback
- Empty states for no data scenarios
- Consistent color palette and spacing
- Basic accessibility (focus states, contrast)

Constraints:
- Do not introduce unnecessary libraries
- Keep the UI simple and readable
- Maintain separation of concerns
- All timestamps must still come from backend

Success Criteria:
- UI looks modern and clean
- Navigation is intuitive
- Role-based experience works correctly
- System is presentable to an interviewer

=====================================
PHASE 11 — Automated Testing
=====================================

Goal:
Add automated tests for the most critical backend and frontend flows, without changing business logic or breaking the current application structure.

Current project structure:
- Backend API project remains in ClockAttendance
- Frontend remains inside ClockAttendance/frontend
- Backend test project will be added inside ClockAttendance/ClockAttendance.Tests

Target structure:

ClockAttendance/
└── ClockAttendance
    ├── Controllers
    ├── Data
    ├── Models
    ├── Services
    ├── frontend
    ├── ClockAttendance.csproj
    └── ClockAttendance.Tests

Scope:
- Backend integration tests
- Backend unit tests
- Frontend component tests
- Optional end-to-end tests only if time permits

Rules:
- Do NOT refactor working production logic unless strictly required for testability
- Do NOT change API contracts
- Prefer testing behavior over implementation details
- Use mocks/fakes for external dependencies such as the Time API
- Keep tests deterministic, readable, and focused on critical scenarios
- Work incrementally and stop after each sub-step

Success Criteria:
- Critical backend API flows are covered by automated tests
- Core frontend screens/components have basic test coverage
- External time dependency is isolated in tests
- Tests run locally with clear commands
Now start implementing PHASE 0. After finishing each phase:
•	Print what was implemented
•	Show files created/modified
•	Show commands to run
•	Do NOT jump phases until I say “continue”.
