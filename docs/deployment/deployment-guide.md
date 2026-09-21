# Deployment Guide

## 1. Requirements
- Node.js 18+ recommended
- MySQL 8.0+
- Access to a local or managed MySQL instance
- A frontend origin value for CORS

## 2. Node.js
Install Node.js and confirm the runtime is available:

```bash
node -v
npm -v
```

## 3. MySQL
Create the database and import schema files:

```bash
mysql -u <username> -p
CREATE DATABASE phc_connect;
USE phc_connect;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

If using the Phase 7 alert migration:

```bash
SOURCE database/phase7_alerts_migration.sql;
```

## 4. Environment variables
Create a `.env` file at the project root with values like:

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

Do not commit `.env` files to source control.

## 5. Database setup
Keep the schema and seed scripts under the `database` folder. These are the source of truth for tables, sample users, facility records, and demo data.

## 6. Backend startup
```bash
cd server
npm install
npm start
```

For development:
```bash
cd server
npm run dev
```

## 7. Frontend build
```bash
cd client
npm install
npm run build
```

To run the UI locally:
```bash
cd client
npm run dev
```

## 8. Production configuration
- Set `CLIENT_URL` to the final frontend origin
- Do not use wildcard CORS origins for authenticated APIs
- Keep JWT secret in the environment, not in code or frontend bundles
- Use a restricted MySQL account where practical
- Confirm the database connection is reachable from the deployment host

## 9. CORS
The backend restricts origins to the configured client URL and localhost development origins. This prevents arbitrary site access to authenticated APIs.

## 10. Security considerations
- Never expose JWT secrets or DB credentials in frontend code
- Use bcrypt hashing for all user passwords
- Keep role checks enforced on the backend
- Review audit logs after operational changes
- Use HTTPS in non-local deployments

## 11. Backup
Create a MySQL dump before a production or demo migration:

```bash
mysqldump -u <username> -p <database_name> > phc_connect_backup.sql
```

Store the backup outside the project directory when possible.
