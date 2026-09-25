<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GroqService
{
    /**
     * Minta LLM jawab pertanyaan HANYA berdasarkan potongan dokumen (chunks)
     * yang paling relevan. Ini inti dari pola RAG (Retrieval-Augmented Generation).
     *
     * @param string $question
     * @param array  $relevantChunks  [['page' => int, 'content' => string], ...]
     */
    public function askWithContext(string $question, array $relevantChunks): string
    {
        $context = collect($relevantChunks)
            ->map(fn ($chunk, $i) => "[Sumber " . ($i + 1) . " - Halaman {$chunk['page']}]\n{$chunk['content']}")
            ->implode("\n\n");

        $systemPrompt = <<<PROMPT
        Kamu adalah asisten yang menjawab pertanyaan HANYA berdasarkan potongan dokumen
        yang diberikan di bawah. Jangan mengarang jawaban di luar isi dokumen.
        Jika jawabannya tidak ada di dalam dokumen, katakan dengan jujur bahwa
        informasi tersebut tidak ditemukan di dokumen ini.

        Jawab dengan bahasa yang sama dengan pertanyaan pengguna, singkat dan jelas.

        DOKUMEN:
        {$context}
        PROMPT;

        $response = Http::withToken(config('services.groq.api_key'))
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => config('services.groq.model', 'llama-3.3-70b-versatile'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $question],
                ],
                'temperature' => 0.2,
            ]);

        $response->throw();

        return $response->json('choices.0.message.content');
    }
}
