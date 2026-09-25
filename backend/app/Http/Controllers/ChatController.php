<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Document;
use App\Services\CurrentUser;
use App\Services\EmbeddingService;
use App\Services\GroqService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private EmbeddingService $embedder,
        private GroqService $groq,
    ) {}

    public function startConversation(Request $request, Document $document)
    {
        $conversation = CurrentUser::get()->conversations()->create([
            'document_id' => $document->id,
            'title' => $document->title,
        ]);

        return response()->json($conversation);
    }

    public function ask(Request $request, Conversation $conversation)
    {
        $request->validate([
            'question' => ['required', 'string', 'max:2000'],
        ]);

        $question = $request->input('question');

        // Simpan pesan user dulu
        $conversation->messages()->create([
            'role' => 'user',
            'content' => $question,
        ]);

        // 1. Ubah pertanyaan jadi vector
        $questionEmbedding = $this->embedder->embed($question);

        // 2. Cari chunk paling relevan (top-K similarity search)
        //    Untuk dataset kecil ini dihitung langsung di PHP; kalau chunk-nya
        //    sudah ribuan, baru worth it pindah ke vector DB dengan index ANN.
        $relevantChunks = $conversation->document->chunks
            ->map(function ($chunk) use ($questionEmbedding) {
                return [
                    'page' => $chunk->page,
                    'content' => $chunk->content,
                    'score' => $this->embedder->cosineSimilarity($questionEmbedding, $chunk->embedding),
                ];
            })
            ->sortByDesc('score')
            ->take(4)
            ->values();

        // 3. Kirim ke LLM sebagai konteks
        $answer = $this->groq->askWithContext($question, $relevantChunks->all());

        $citations = $relevantChunks
            ->map(fn ($c) => ['page' => $c['page'], 'snippet' => $c['content']])
            ->all();

        $message = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $answer,
            'citations' => $citations,
        ]);

        return response()->json($message);
    }

    public function history(Conversation $conversation)
    {
        return $conversation->messages;
    }
}
