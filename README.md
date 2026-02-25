# Hospital Bed Management Dashboard

Real-time hospital operations dashboard built with Laravel 12, Inertia.js, React 19, and TypeScript.

## Stack

| Layer | Technology |
| --- | --- |
| Backend | PHP 8.2 + Laravel 12 |
| Frontend bridge | Inertia.js v2 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MySQL / MariaDB |
| File storage | AWS S3 |
| Auth | Laravel Breeze (session auth) |
| Build tool | Vite 6 |

## Features

- Multi-page authenticated app: Dashboard, Beds, Patients, Documents, Notifications, Wards
- Drag-and-drop bed layout with saved coordinates (`/api/beds/{bed}/position`)
- Patient admission, assignment, and discharge workflows
- Document upload + delete via S3
- Notification feed with mark-read and bulk clear
- Login, Register, Forgot Password, Reset Password
- Minimalist professional UI with responsive desktop/mobile navigation

## Quick Start

### Requirements

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8.0+ (or MariaDB equivalent)

### 1. Install dependencies

```bash
composer install
npm install
```

### 2. Prepare environment

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure database in `.env`

Set:

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=housing_par`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### 4. Run migrations and seed

```bash
php artisan migrate
php artisan db:seed
```

Default seeded admin account:

- Email: `admin@hospital.local`
- Password: `password`

### 5. Run app

```bash
npm run dev
php artisan serve
```

Open: `http://localhost:8000`

## Full Windows MySQL Setup (Native Install)

Use this if MySQL is not installed yet.

### Step 1. Install MySQL Server

1. Download **MySQL Installer for Windows** from the official MySQL site.
2. Run installer and choose:
   - `Developer Default` (recommended), or
   - `Server only` if you do not need extra tooling.
3. During setup:
   - Keep port `3306`
   - Enable Windows service startup
   - Set root password and save it securely.

### Step 2. Verify service is running

Open PowerShell as admin:

```powershell
Get-Service *mysql*
```

If stopped:

```powershell
Start-Service MySQL80
```

### Step 3. Test root login

```powershell
mysql -u root -p
```

Enter the root password you set during installation.

### Step 4. Create app database and app user

Run in MySQL shell:

```sql
CREATE DATABASE housing_par CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'housing_user'@'localhost' IDENTIFIED BY 'ChangeThisStrongPassword!';
GRANT ALL PRIVILEGES ON housing_par.* TO 'housing_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 5. Update Laravel `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=housing_par
DB_USERNAME=housing_user
DB_PASSWORD=ChangeThisStrongPassword!
```

Then clear cached config:

```bash
php artisan config:clear
php artisan cache:clear
```

### Step 6. Run schema + seed

```bash
php artisan migrate
php artisan db:seed
```

### Step 7. Validate connection

```bash
php artisan tinker
```

In Tinker:

```php
DB::connection()->getPdo();
```

If it returns a PDO object, MySQL connectivity is good.

### Step 8. Common MySQL issues

- `SQLSTATE[HY000] [2002] Connection refused`
  - MySQL service is not running, or port/host is wrong.
- `Access denied for user`
  - Username/password mismatch or missing privileges.
- `Unknown database 'housing_par'`
  - Create DB first or fix `DB_DATABASE`.
- `could not find driver`
  - Enable/install PHP `pdo_mysql` extension.

## Routes

Core page routes:

- `GET /` dashboard
- `GET /beds`
- `GET /patients`
- `GET /documents`
- `GET /notifications`
- `GET /wards`

Auth routes:

- `GET|POST /login`
- `GET|POST /register`
- `GET|POST /forgot-password`
- `GET /reset-password/{token}`
- `POST /reset-password`
- `POST /logout`

## Development Checks

```bash
npm run lint
php artisan test
```
