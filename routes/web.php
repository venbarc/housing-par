<?php

use App\Http\Controllers\BedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\WardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('beds', [BedController::class, 'index'])->name('beds.index');
    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('wards', [WardController::class, 'index'])->name('wards.index');

    // Beds
    Route::post('beds', [BedController::class, 'store'])->name('beds.store');
    Route::patch('beds/{bed}', [BedController::class, 'update'])->name('beds.update');
    Route::delete('beds/{bed}', [BedController::class, 'destroy'])->name('beds.destroy');
    Route::post('beds/{bed}/assign', [BedController::class, 'assign'])->name('beds.assign');
    Route::post('beds/{bed}/discharge', [BedController::class, 'discharge'])->name('beds.discharge');

    // Patients
    Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
    Route::patch('patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    Route::delete('patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

    // Wards
    Route::post('wards', [WardController::class, 'store'])->name('wards.store');
    Route::patch('wards/{ward}', [WardController::class, 'update'])->name('wards.update');
    Route::delete('wards/{ward}', [WardController::class, 'destroy'])->name('wards.destroy');

    // Documents
    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Notifications
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

require __DIR__.'/auth.php';
