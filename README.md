# PHC CONNECT

## Project overview
PHC CONNECT is a healthcare workflow and monitoring system for Primary Health Centres (PHCs), Upgraded Primary Health Centres (UPHCs), and Health Sub-Centres (HSCs). It supports DDHS monitoring, doctor attendance tracking, daily service reporting, absenteeism alerts, and protected report access.

This project stays focused on monitoring, validation, and operational hardening. It does not include unrelated clinical or billing workflows.

## Technology stack
- Frontend: React + Vite + JavaScript + CSS + React Router
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT + bcryptjs
- Security: Helmet, CORS configuration, rate limiting, backend role checks
- Testing: Node.js built-in test runner + frontend production build

## Folder structure
```text
phc-connect/
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   ├── test/
│   └── package.json
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── phase7_alerts_migration.sql
├── docs/
│   ├── security-review.md
│   └── production-checklist.md
├── .env.example
├── .gitignore
├── README.md
└── .env
```

## Installation
1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```
3. Create the local environment file from the sample:
   ```bash
   copy .env.example .env
   ```

## Environment variables
Update the root `.env` file with secure local values before starting the server.

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=phc_connect
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=8h
ABSENCE_EVALUATION_TIME=10:00
ALERT_CHECK_INTERVAL_MINUTES=5
```

Important security notes:
- `JWT_SECRET` must be set in the backend environment only.
- Do not commit real secrets to source control.
- `CLIENT_URL` is the only allowed frontend origin for CORS.

## Database setup
1. Create the MySQL database named `phc_connect`.
2. Import the schema:
   ```bash
   mysql -u <username> -p < database/schema.sql
   ```
3. Import seed data if needed:
   ```bash
   mysql -u <username> -p < database/seed.sql
   ```
4. If using the alert migration step, apply it as needed:
   ```bash
   mysql -u <username> -p < database/phase7_alerts_migration.sql
   ```

## Start the backend
```bash
cd server
npm start
```

For automatic restarts during development:
```bash
cd server
npm run dev
```

## Start the frontend
```bash
cd client
npm run dev
```

## Login roles
Development/demo accounts:
- DDHS: `ddhs.admin` / `ddhs@123`
- Doctor: `dr.raman` / `doctor@123`

Use demo credentials only in local development. Do not use them in production.

## API overview
Core endpoints:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/attendance/mark`
- `GET /api/attendance/history/:doctorId`
- `POST /api/services/submit`
- `GET /api/services/history/:doctorId`
- `GET /api/ddhs/*`
- `GET /api/alerts`
- `POST /api/alerts/:id/acknowledge`
- `POST /api/alerts/:id/resolve`
- `GET /api/reports/*`
- `GET /api/health`

## Testing commands
```bash
cd server
npm test

cd client
npm run build
```

## Security notes
- JWT secrets are required from environment variables only.
- Passwords are stored as bcrypt hashes, never in plain text.
- Protected routes are enforced on the backend.
- Role checks prevent DDHS-only or doctor-only access from being bypassed by the frontend.
- Input validation and parameterized SQL are used throughout the API.
- Start-up and login protections are enabled for production-oriented hardening.

## Final status
This project includes the Phase 9 security and hardening updates: JWT protection, role enforcement, input validation, audit logging, secure CORS, and improved API consistency.
