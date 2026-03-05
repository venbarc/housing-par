<?php

use App\Http\Controllers\BedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('beds', [BedController::class, 'index'])->name('beds.index');
    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('facilities', [FacilityController::class, 'index'])->name('facilities.index');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    // Beds
    Route::post('beds', [BedController::class, 'store'])->name('beds.store');
    Route::patch('beds/{bed}', [BedController::class, 'update'])->name('beds.update');
    Route::delete('beds/{bed}', [BedController::class, 'destroy'])->name('beds.destroy');
    Route::post('beds/{bed}/discharge', [BedController::class, 'discharge'])->name('beds.discharge');

    // Patients
    Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
    Route::patch('patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    Route::delete('patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

    // Facilities
    Route::post('facilities', [FacilityController::class, 'store'])->name('facilities.store');
    Route::patch('facilities/{facility}', [FacilityController::class, 'update'])->name('facilities.update');
    Route::delete('facilities/{facility}', [FacilityController::class, 'destroy'])->name('facilities.destroy');

    // Rooms
    Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::patch('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    // Documents
    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Notifications
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

require __DIR__.'/auth.php';
