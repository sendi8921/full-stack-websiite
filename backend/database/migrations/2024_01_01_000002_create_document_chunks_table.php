<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('chunk_index');
            $table->unsignedInteger('page')->nullable();
            $table->text('content');
            // Embedding disimpan sebagai JSON array of float.
            // Untuk skala kecil (tutorial/demo) ini cukup; kalau datanya besar,
            // baru worth it pindah ke vector DB (pgvector/Chroma) untuk index ANN.
            $table->json('embedding');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_chunks');
    }
};
