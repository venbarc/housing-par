<?php

use App\Http\Controllers\Admin\ProgramsController as AdminProgramsController;
use App\Http\Controllers\Admin\AuditLogsController as AdminAuditLogsController;
use App\Http\Controllers\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DischargeController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

    Route::middleware(['auth', 'can_login'])->group(function () {
    Route::get('pending-assignment', function () {
        return Inertia::render('PendingAssignment');
    })->name('pending-assignment');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('users', [AdminUsersController::class, 'index'])->name('users.index');
        Route::patch('users/{user}/assignment', [AdminUsersController::class, 'updateAssignment'])->name('users.assignment');
        Route::patch('users/{user}/admin', [AdminUsersController::class, 'updateAdmin'])->name('users.admin');

        Route::get('programs', [AdminProgramsController::class, 'index'])->name('programs.index');
        Route::post('programs', [AdminProgramsController::class, 'store'])->name('programs.store');
        Route::patch('programs/{program}', [AdminProgramsController::class, 'update'])->name('programs.update');
        Route::delete('programs/{program}', [AdminProgramsController::class, 'destroy'])->name('programs.destroy');

        Route::get('audit-logs', [AdminAuditLogsController::class, 'index'])->name('audit-logs.index');
    });
});

Route::middleware(['auth', 'can_login', 'allocated'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('beds', [BedController::class, 'index'])->name('beds.index');
    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('facilities', [FacilityController::class, 'index'])->name('facilities.index');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export/beds', [ReportController::class, 'exportBeds'])->name('reports.export.beds');
    Route::get('reports/export/discharges', [ReportController::class, 'exportDischarges'])->name('reports.export.discharges');
    Route::get('discharges', [DischargeController::class, 'index'])->name('discharges.index');
    Route::get('transfers', [TransferController::class, 'index'])->name('transfers.index');
    Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');

    // Beds
    Route::post('beds', [BedController::class, 'store'])->name('beds.store');
    Route::patch('beds/{bed}', [BedController::class, 'update'])->name('beds.update');
    Route::delete('beds/{bed}', [BedController::class, 'destroy'])->name('beds.destroy');
    Route::post('beds/{bed}/discharge', [BedController::class, 'discharge'])->name('beds.discharge');

    // Patients
    Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
    Route::patch('patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    Route::delete('patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

    // Transfers
    Route::post('transfers/{transfer}/accept', [TransferController::class, 'accept'])->name('transfers.accept');
    Route::post('transfers/{transfer}/reject', [TransferController::class, 'reject'])->name('transfers.reject');

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

    // Import
    Route::get('import', [ImportController::class, 'index'])->name('import.index');
    Route::get('import/template/rooms-beds', [ImportController::class, 'templateRoomsBeds'])->name('import.template.rooms-beds');
    Route::get('import/template/patients', [ImportController::class, 'templatePatients'])->name('import.template.patients');
    Route::post('import/rooms-beds', [ImportController::class, 'importRoomsBeds'])->name('import.rooms-beds');
    Route::post('import/patients', [ImportController::class, 'importPatients'])->name('import.patients');
});

require __DIR__.'/auth.php';
