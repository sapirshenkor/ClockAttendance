

# Employee Attendance Clock Application

## 1. Project Overview

The Employee Attendance Clock is a full-stack system designed to manage employee attendance in a secure, reliable, and auditable manner.

The system supports role-based access for:
- **Employees** – clock in/out and view shift history
- **Administrators** – manage employees and attendance records

### Core Idea
The system ensures that all attendance data is:
- Accurate
- Consistent
- Resistant to manipulation

### Key Constraints
- **No local time usage** (server or browser)
- **All timestamps come from an external Time API (Europe/Zurich)**
- **JWT-based authentication with strict role separation**

---

## 2. System Architecture

The system follows a layered architecture with clear separation of concerns.

### Components

#### Frontend (React)
- Handles UI and user interaction
- Sends HTTP requests to backend
- Manages authentication state (JWT)

#### Backend (ASP.NET Core Web API)
- Handles authentication and authorization
- Implements business logic via services
- Enforces all system constraints (especially time handling)

#### Database (SQL Server)
- Stores users and attendance data
- Enforces constraints (e.g., one open shift per user)

#### External Time API
- Provides authoritative timestamps
- Eliminates reliance on local system clocks

---

## 3. Architecture Diagram

```mermaid
graph TD
    User -->|Interacts| React
    React -->|HTTP + JWT| API
    API -->|Validate Token| Identity
    API -->|Fetch Time| TimeAPI
    API -->|Read/Write| Database
    Database --> API
    TimeAPI --> API
    API -->|Response| React
````

---

## 4. Backend Architecture

The backend is structured to enforce separation between transport, logic, and persistence.

### Controllers

* Handle HTTP requests and responses
* Extract user identity from JWT
* Delegate logic to services

Examples:

* `AuthController`
* `AttendanceController`
* `AdminController`

---

### Services (Core Business Logic)

#### AttendanceService

* Handles clock-in and clock-out operations
* Ensures only one open shift per user
* Validates shift lifecycle

#### AdminService

* Manages employee creation and activation
* Allows editing and closing of shifts

#### TimeService (Critical Component)

* Abstracts external time API
* Enforces system-wide time constraints

---

### Data Layer

#### ApplicationDbContext

* Handles database access via EF Core
* Manages entities and relationships

#### Entities

* `EmployeeProfile`
* `AttendanceShift`

---

### DTOs

* Define API contracts
* Separate internal models from external responses

---

### Exception Handling

* Centralized error handling via custom exceptions
* Consistent error responses across the system

---

## 5. External Time Handling (Critical Design)

This system enforces a strict rule:

> ❗ No usage of `DateTime.Now`, `UtcNow`, or browser time in business logic.

### Implementation

* All time operations go through `ITimeService`
* `TimeService` calls an external API (Europe/Zurich)
* Services depend on abstraction, not implementation

### Behavior on Failure

* If the Time API fails → system returns **HTTP 503**
* No fallback to local time is allowed

### Why This Matters

* Prevents time manipulation
* Ensures consistency across environments
* Enables reliable auditing

---

## 6. Frontend Architecture

The frontend is a React application structured for clarity and modularity.

### Structure

#### Pages

* `LoginPage`
* `EmployeeDashboard`
* `AdminPanel`
* `ShiftHistory`

#### Components

* `Navbar`
* `LoadingSpinner`
* `ErrorMessage`

#### API Layer

* Centralized API client (Axios)
* Automatically attaches JWT token

---

### Authentication Flow (Frontend)

1. User logs in
2. Backend returns JWT
3. Token is stored in `localStorage`
4. All API requests include:

```
Authorization: Bearer <token>
```

---

### Route Protection

* `ProtectedRoute` enforces:

  * Authentication
  * Role-based access

---

## 7. Core Features

### Authentication

* Secure login via ASP.NET Identity
* JWT issued on successful login

### Attendance Management

* Clock In
* Clock Out
* Shift history

### Admin Capabilities

* Create employees
* Activate / deactivate employees
* Edit and close shifts

---

## 8. Request Flow Examples

### Clock In Flow (Detailed)

1. User clicks "Clock In"
2. Frontend sends `POST /api/attendance/clock-in`
3. Backend extracts user ID from JWT
4. Checks for existing open shift
5. Calls Time API via `ITimeService`
6. Creates new shift (status = Open)
7. Saves to database
8. Returns success response

**Edge Case:**

* If open shift exists → HTTP 409

---

### Login Flow

1. User submits credentials
2. Backend validates using ASP.NET Identity
3. JWT token is generated
4. Token returned to frontend
5. Frontend stores token and updates state

---

## 9. Database Design

### Entities

#### EmployeeProfile

* Stores employee data
* Linked to Identity user

#### AttendanceShift

* Stores clock-in and clock-out timestamps
* Tracks shift status (Open/Closed)

---

### Relationships

* One Employee → Many Shifts

---

### Constraints

* Only one open shift per user
* Unique employee identifiers

---

## 10. API Overview

### Auth

* `POST /api/auth/login`

### Attendance

* `POST /api/attendance/clock-in`
* `POST /api/attendance/clock-out`
* `GET /api/attendance/shifts`

### Admin

* `GET /api/admin/AllEmployees`
* `POST /api/admin/CreateEmployees`
* `PATCH /api/admin/employees/{employeeNumber}/status`
* `PUT /api/admin/attendance/{shiftId}`
* `POST /api/admin/attendance/{shiftId}/close`

---

## 11. Running the Project

### Backend

```bash
dotnet restore
dotnet build
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Database (Docker)

```bash
docker-compose up
```

---

## 12. Environment Variables

### Backend

* `ConnectionStrings:DefaultConnection`
* `Jwt:Key`
* `Jwt:Issuer`
* `Jwt:Audience`
* `SEED_ADMIN_EMPLOYEE_NUMBER`
* `SEED_ADMIN_PASSWORD ` 
* `SEED_ADMIN_FIRST_NAME`  
* `SEED_ADMIN_LAST_NAME`  
* `DB_CONNECTION_STRING`

### Frontend

* `REACT_APP_API_URL`

---

## 13. Key Design Decisions

### External Time API

* Guarantees time integrity
* Prevents manipulation

### Service Layer

* Separates business logic from controllers
* Improves maintainability and testability

### JWT Authentication

* Stateless and scalable
* Clean separation between client and server

### Role-Based Access

* Enforces security boundaries
* Simplifies UI logic

---

## 14. Future Improvements

* Enhanced UI/UX
* Caching for Time API
* Advanced reporting and analytics
* Audit logging
* Scalability improvements

