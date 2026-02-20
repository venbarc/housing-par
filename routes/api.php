<?php

use App\Http\Controllers\BedController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are stateless JSON endpoints called directly via fetch()
| from the React components (e.g., canvas drag-and-drop position updates).
*/

// Bed position update — fire-and-forget from BedCanvas drag
Route::patch('beds/{bed}/position', [BedController::class, 'updatePosition']);
