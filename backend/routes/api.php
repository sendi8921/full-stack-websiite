<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

// CATATAN: sementara tanpa login (auth:sanctum) dulu biar gampang dites.
// Semua request dianggap dari satu "demo user" (lihat App\Services\CurrentUser).
// Kalau nanti sudah siap tambah login beneran, tinggal aktifkan lagi
// middleware auth:sanctum dan hapus App\Services\CurrentUser.
Route::get('/documents', [DocumentController::class, 'index']);
Route::post('/documents', [DocumentController::class, 'store']);
Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);

Route::post('/documents/{document}/conversations', [ChatController::class, 'startConversation']);
Route::get('/conversations/{conversation}/messages', [ChatController::class, 'history']);
Route::post('/conversations/{conversation}/ask', [ChatController::class, 'ask']);
