<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Support\Tenant;

class EnsureUserAllocated
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_admin) {
            $programIds = Tenant::programIds($user);
            if (! $user->facility_id || empty($programIds)) {
                if (! $request->routeIs('pending-assignment')) {
                    return redirect()->route('pending-assignment');
                }
            }
        }

        return $next($request);
    }
}
