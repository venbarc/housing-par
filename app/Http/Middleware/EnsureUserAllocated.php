<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
class EnsureUserAllocated
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_admin) {
            if (! $user->facility_id) {
                if (! $request->routeIs('pending-assignment')) {
                    return redirect()->route('pending-assignment');
                }
            }
        }

        return $next($request);
    }
}
