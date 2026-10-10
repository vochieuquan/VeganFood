# VeganFood

Full stack vegetarian restaurant ordering application combined from the Vegan-Food front end and the backend supplied for this workspace.

## Project layout

- `frontend/` — React application
- `backend/` — Spring Boot API and database schema

## Local setup

Requirements: Node.js 18 or newer, Java 21, and MySQL 8.

1. Create a local backend environment file from `backend/.env.example` and replace every placeholder. Use a newly generated `JWT_SECRET` of at least 32 bytes. Set `BOOTSTRAP_OWNER_EMAIL` and a strong owner password (14–72 UTF-8 bytes) for the first database startup.
2. Create the MySQL database and tables by running `backend/src/main/resources/database/migration/VeganFood.sql`. The file contains schema only; it no longer inserts sample accounts or personal data.
3. Start the API from `backend/` with `./mvnw spring-boot:run` (Windows: `./mvnw.cmd spring-boot:run`). The first startup creates the owner account when no owner exists. Existing databases with an owner do not need bootstrap credentials.
4. Create `frontend/.env` from `frontend/.env.example`. Set the Google OAuth client ID and API URL, then run `npm ci` and `npm start` from `frontend/`.

The API validates the schema by default. If you already have a database created from the original schema, take a backup and run `backend/src/main/resources/database/migration/VeganFood-legacy-upgrade.sql` once before starting the updated API. It preserves existing rows while aligning table names, payment statuses, and order ownership columns. Set `SPRING_JPA_HIBERNATE_DDL_AUTO=update` only for a disposable local database when you intentionally want Hibernate to alter its schema.

## Production configuration

Set the backend values in the deployment platform's secret/environment settings: database URL/user/password, `JWT_SECRET`, Google client ID, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, PayOS credentials, and the initial owner credentials if the database has no owner. Set the frontend build variables `REACT_APP_API_URL` and `REACT_APP_GOOGLE_CLIENT_ID` before building.

Configure the PayOS channel webhook to the public HTTPS URL `https://<api-host>/api/payment/webhook`. The browser return URL only displays the order result; the backend marks an online order paid after validating the PayOS HMAC signature, order ID, payment method, and amount. Payment orders use the local order ID as their PayOS `orderCode`.

Gemini features call the provider through the backend. They remain disabled until `GEMINI_API_KEY` is set in the backend environment. Never put this key in a React environment variable or browser bundle. Any credentials found in the supplied source files, including the previously embedded Gemini key, should be rotated before deployment.

## Build

From `frontend/`: `npm run build`

From `backend/`: `./mvnw -DskipTests package` (Windows: `./mvnw.cmd -DskipTests package`)
