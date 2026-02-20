# Hospital Bed Management Dashboard

A real-time hospital bed management system built with **Laravel 12**, **Inertia.js**, **React 19**, and **TypeScript**.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.2 + Laravel 12 |
| Frontend bridge | Inertia.js v2 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MySQL / MariaDB |
| File storage | AWS S3 |
| Auth | Laravel Breeze (session-based) |
| Build tool | Vite 6 |

## Features

- **Bed canvas** — drag-and-drop bed positioning with status colour coding
- **Patient management** — admit, assign to bed, discharge
- **Ward overview** — floor-organised ward cards
- **Document management** — upload patient documents to S3
- **Notifications** — activity log with mark-as-read and delete
- **Live polling** — dashboard refreshes every 3 seconds via Inertia partial reloads
- **Authentication** — register / login / forgot-password / reset-password

## Setup

### Requirements

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL / MariaDB

### 1. Install PHP dependencies

```bash
composer install
```

### 2. Environment configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set:
- `DB_*` — MySQL credentials
- `AWS_*` — S3 credentials (required for document uploads)

### 3. Database

```bash
php artisan migrate
php artisan db:seed          # seeds wards, beds, patients, notifications, and an admin user
```

Default admin credentials (from seeder):
- **Email**: `admin@hospital.local`
- **Password**: `password`

### 4. Install Node dependencies and build assets

```bash
npm install
npm run dev     # development with HMR
# or
npm run build   # production build
```

### 5. Start the server

```bash
php artisan serve
```

Visit **http://localhost:8000** and log in.

## Project Structure

```
app/
  Http/
    Controllers/        Laravel controllers (Dashboard, Bed, Patient, Ward, Document, Notification)
    Middleware/         HandleInertiaRequests
    Requests/           Form request validation classes
  Models/               Eloquent models (Bed, Patient, Ward, Document, Notification, User)
database/
  migrations/           MySQL schema
  seeders/              Sample data seeder
resources/
  js/
    Pages/              Inertia page components (Dashboard, Auth/*)
    components/         Reusable React components
    lib/                status.ts, utils.ts helpers
    types/              TypeScript interfaces
  css/app.css           Tailwind v4 + custom design tokens
  views/app.blade.php   Inertia root template
routes/
  web.php               Inertia web routes (auth-protected)
  api.php               Stateless JSON API (bed position updates)
  auth.php              Breeze auth routes
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Dashboard (Inertia) |
| `POST` | `/beds` | Create bed |
| `PATCH` | `/beds/{id}` | Update bed |
| `DELETE` | `/beds/{id}` | Delete bed |
| `POST` | `/beds/{id}/assign` | Assign patient |
| `POST` | `/beds/{id}/discharge` | Discharge patient |
| `PATCH` | `/api/beds/{id}/position` | Update canvas position (JSON) |
| `POST` | `/patients` | Create patient |
| `PATCH` | `/patients/{id}` | Update patient |
| `DELETE` | `/patients/{id}` | Delete patient |
| `POST` | `/wards` | Create ward |
| `PATCH` | `/wards/{id}` | Update ward |
| `DELETE` | `/wards/{id}` | Delete ward |
| `POST` | `/documents` | Upload document to S3 |
| `DELETE` | `/documents/{id}` | Delete document from S3 + DB |
| `PATCH` | `/notifications/{id}/read` | Mark notification as read |
| `DELETE` | `/notifications/{id}` | Delete notification |
