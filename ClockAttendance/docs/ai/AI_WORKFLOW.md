# AI Workflow: ClockAttendance

## Guidelines for Using AI Agents

### AI Agents Should:
- Respect existing architecture.
- Keep controllers thin.
- Place business logic in Services.
- Follow system constraints strictly.
- Use external Zurich Time API for timestamps.
- Ensure database constraints are enforced.

### AI Agents Should Not:
- Change core system constraints.
- Replace the time source logic.
- Modify identifiers without explicit instruction.
- Perform large refactors unless requested.

## Developer Reference
Developers may reference the files under `/docs/ai` when prompting the AI for assistance. These files provide context about the system's architecture, constraints, and implementation decisions.