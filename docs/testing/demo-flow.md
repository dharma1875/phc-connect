# Demo Flow

## Objective
Provide a clean demonstration of the PHC CONNECT workflow without loading unnecessary features or deep operational complexity.

## Recommended demo path

### 1. Landing and login
- Open the frontend in the configured local environment
- Sign in with a doctor or DDHS demo account
- Confirm that protected routes are enforced

### 2. Doctor workflow
- Access the doctor dashboard
- Review assigned facility context
- Mark or review attendance
- Submit healthcare service activity
- Confirm data persistence and dashboard updates

### 3. DDHS workflow
- Log in as a DDHS user
- Navigate to facility and attendance views
- Review monitoring by district, taluk, or facility
- Inspect absenteeism alerts and facility-level summaries
- Open report pages to show aggregate data

### 4. Alert monitoring
- Trigger or review absenteeism conditions in the seeded demo data
- Demonstrate that the alert engine is active and not duplicated on repeated startup
- Show the operational monitoring intent of the system

### 5. Security and reliability
- Show that logout and session protection work
- Demonstrate a protected route denial when no valid token is present
- Discuss the hardened JWT configuration, CORS restrictions, and rate limiting in production

## Suggested talking points
- The platform is purpose-built for PHC monitoring and district oversight.
- Role separation is enforced in both UI and backend routes.
- Attendance and service actions are operationally scoped to the correct user role.
- The project includes audit logging and security hardening for production readiness.
