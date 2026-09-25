<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class EmbeddingService
{
    /**
     * Ubah teks jadi vector (array of float) pakai embedding API.
     *
     * Catatan: Groq belum punya endpoint embedding sendiri saat tutorial ini
     * dibuat, jadi dicontohkan pakai endpoint yang kompatibel format OpenAI
     * (bisa OpenAI langsung, atau provider lain yang open source seperti
     * Jina AI / HuggingFace Inference API). Tinggal ganti base URL + API key
     * di .env sesuai provider yang kamu pakai.
     */
    public function embed(string $text): array
    {
        $response = Http::withToken(config('services.embedding.api_key'))
            ->post(config('services.embedding.base_url') . '/embeddings', [
                'model' => config('services.embedding.model'),
                'input' => $text,
            ]);

        $response->throw();

        return $response->json('data.0.embedding');
    }

    /**
     * Hitung banyak embedding sekaligus (lebih hemat request daripada satu-satu).
     */
    public function embedBatch(array $texts): array
    {
        $response = Http::withToken(config('services.embedding.api_key'))
            ->post(config('services.embedding.base_url') . '/embeddings', [
                'model' => config('services.embedding.model'),
                'input' => $texts,
            ]);

        $response->throw();

        return collect($response->json('data'))
            ->sortBy('index')
            ->pluck('embedding')
            ->values()
            ->all();
    }

    /**
     * Cosine similarity antara dua vector. Hasil mendekati 1 = sangat mirip,
     * mendekati 0 = tidak berhubungan.
     */
    public function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $i => $valueA) {
            $valueB = $b[$i] ?? 0;
            $dot += $valueA * $valueB;
            $normA += $valueA ** 2;
            $normB += $valueB ** 2;
        }

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }
}
