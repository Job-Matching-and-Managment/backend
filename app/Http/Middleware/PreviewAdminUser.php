<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Local-only: render admin pages without visiting the login form.
 * Does not persist a session unless the user is already authenticated.
 */
class PreviewAdminUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment('local')) {
            abort(404);
        }

        if (! Auth::check()) {
            $admin = User::role('admin')->first();

            if ($admin) {
                Auth::login($admin);
            }
        }

        return $next($request);
    }
}
