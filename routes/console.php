<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('user:create-admin {email=admin@hospital.local} {--name=} {--password=}', function () {
    $email = (string) $this->argument('email');
    $name = (string) ($this->option('name') ?: 'Admin Nurse');
    $password = (string) ($this->option('password') ?: 'password');

    $user = User::firstOrNew(['email' => $email]);
    $isNew = ! $user->exists;
    $didSetPassword = false;

    $user->name = $name;
    $user->is_admin = true;

    if ($isNew || $this->option('password')) {
        $user->password = Hash::make($password);
        $didSetPassword = true;
    }

    $user->save();

    $this->info('Admin account ready:');
    $this->line("  Email: {$email}");
    if ($didSetPassword) {
        $this->line("  Password: {$password}");
    } else {
        $this->line('  Password: (unchanged)');
    }
})->purpose('Create or update an admin user');
