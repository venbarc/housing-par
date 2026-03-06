<?php

namespace App\Providers;

use App\Models\Bed;
use App\Models\Document;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\PatientTransfer;
use App\Models\Program;
use App\Models\Room;
use App\Observers\AuditableObserver;
use App\Services\AuditLogger;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Facility::observe(AuditableObserver::class);
        Program::observe(AuditableObserver::class);
        Room::observe(AuditableObserver::class);
        Bed::observe(AuditableObserver::class);
        Patient::observe(AuditableObserver::class);
        PatientTransfer::observe(AuditableObserver::class);
        Document::observe(AuditableObserver::class);
        Notification::observe(AuditableObserver::class);

        Event::listen(Registered::class, function (Registered $event) {
            $user = $event->user;
            AuditLogger::log('register', $user, null, ['email' => $user->email, 'name' => $user->name], $user->facility_id, $user->program_id);
        });

        Event::listen(Login::class, function (Login $event) {
            $user = $event->user;
            AuditLogger::log('login', $user, null, null, $user->facility_id, $user->program_id);
        });

        Event::listen(Logout::class, function (Logout $event) {
            $user = $event->user;
            AuditLogger::log('logout', $user, null, null, $user?->facility_id, $user?->program_id);
        });
    }
}
