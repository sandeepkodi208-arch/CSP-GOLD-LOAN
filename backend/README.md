# Golden Gem Manager Backend

This is the Node.js + Express + MySQL backend for the Golden Gem Manager project.
It strictly operates separately from the React frontend, providing REST APIs, authentication, and database services.

## Prerequisites
- Node.js (v18+)
- MySQL Server

## 1. How to install dependencies
Navigate into the `backend` directory and run:
\`\`\`bash
cd backend
npm install
\`\`\`

## 2. How to create the MySQL database & 3. Import schema.sql
Ensure your MySQL server is running. Log into MySQL and run the schema file:
\`\`\`bash
mysql -u root -p < database/schema.sql
\`\`\`
This will create the `golden_gem_manager` database and all required tables.

## 4. How to import seed.sql
To populate the database with safe demo data, run:
\`\`\`bash
mysql -u root -p < database/seed.sql
\`\`\`

## 5. How to configure .env
Create a `.env` file in the `backend` folder (you can copy `.env.example`).
\`\`\`env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=golden_gem_manager
JWT_SECRET=change_this_secret
CORS_ORIGIN=http://localhost:5173
\`\`\`

## 6. How to start backend
For development (watching changes):
\`\`\`bash
npm run dev
\`\`\`
For production:
\`\`\`bash
npm run build
npm start
\`\`\`

## 7. How to test /api/health
Open your browser or use Postman / curl:
\`\`\`bash
curl http://localhost:5000/api/health
\`\`\`
Expected Response:
\`\`\`json
{
  "success": true,
  "message": "Golden Gem Manager API is running and connected to DB"
}
\`\`\`

## 8. All available API endpoints

**Auth:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Protected)

**Customers:** (Protected)
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

**Loans:** (Protected)
- `GET /api/loans`
- `GET /api/loans/:id`
- `POST /api/loans`
- `PUT /api/loans/:id`
- `DELETE /api/loans/:id`

**Payments:** (Protected)
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/payments/:id`
- `GET /api/loans/:loanId/payments`

**Gold Rates:** (Protected)
- `GET /api/gold-rates`
- `POST /api/gold-rates`
- `GET /api/gold-rates/latest`
- `PUT /api/gold-rates/:id`
- `DELETE /api/gold-rates/:id`

**Appraisals:** (Protected)
- `GET /api/appraisals`
- `POST /api/appraisals`
- `GET /api/appraisals/:id`
- `PUT /api/appraisals/:id`
- `DELETE /api/appraisals/:id`

**Reports:** (Protected)
- `GET /api/reports/dashboard`
- `GET /api/reports/customers`
- `GET /api/reports/loans`
- `GET /api/reports/payments`
- `GET /api/reports/overdue`
- `GET /api/reports/gold-rates`

## 9. Example requests

### Login Request
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@goldengem.com","password":"password123"}'
\`\`\`

### Authorized Request (Dashboard)
\`\`\`bash
curl -H 'Authorization: Bearer <TOKEN_HERE>' \
     http://localhost:5000/api/reports/dashboard
\`\`\`

## 10. How React frontend will connect to the backend
1. Open the frontend source.
2. Maintain your existing React pages and styles.
3. Anywhere you currently hold static data, make a `fetch()` or `axios` call to `http://localhost:5000/api/...`
4. Make sure to capture the JWT token on login (e.g. `localStorage.setItem('token', data.token)`).
5. Attach the token in your headers: `Authorization: 'Bearer ' + token` for all protected routes.
6. Handle UI states (loading, error, success) based on the JSON response from the API.
