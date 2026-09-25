<?php

namespace App\Services;

use App\Models\User;

class CurrentUser
{
    /**
     * Sementara belum ada sistem login, semua request dianggap datang dari
     * satu user "demo" ini (dibuat otomatis kalau belum ada di database).
     *
     * Setelah nanti kamu tambahkan auth beneran (mis. Laravel Breeze),
     * ganti semua pemanggilan CurrentUser::get() dengan $request->user(),
     * lalu aktifkan lagi middleware auth:sanctum di routes/api.php.
     */
    public static function get(): User
    {
        return User::firstOrCreate(
            ['email' => 'demo@example.com'],
            ['name' => 'Demo User', 'password' => bcrypt('password')]
        );
    }
}
