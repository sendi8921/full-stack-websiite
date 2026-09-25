<?php

// Tambahkan 2 method ini ke dalam class User yang sudah ada di
// app/Models/User.php (project Laravel default kamu).
// Taruh di dalam class, di bawah method-method yang sudah ada.

use Illuminate\Database\Eloquent\Relations\HasMany;

public function documents(): HasMany
{
    return $this->hasMany(\App\Models\Document::class);
}

public function conversations(): HasMany
{
    return $this->hasMany(\App\Models\Conversation::class);
}
