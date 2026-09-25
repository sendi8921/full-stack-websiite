<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\ChunkingService;
use App\Services\CurrentUser;
use App\Services\EmbeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;

class DocumentController extends Controller
{
    public function __construct(
        private ChunkingService $chunker,
        private EmbeddingService $embedder,
    ) {}

    public function index(Request $request)
    {
        return CurrentUser::get()->documents()->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'], // max 20MB
        ]);

        $file = $request->file('file');
        $path = $file->store('documents');

        $document = CurrentUser::get()->documents()->create([
            'title' => $file->getClientOriginalName(),
            'file_path' => $path,
            'status' => 'processing',
        ]);

        // Untuk skala tutorial ini dipanggil langsung (synchronous).
        // Di proyek produksi, sebaiknya ini dilempar ke queue job
        // (php artisan queue:work) supaya upload tidak nge-block request.
        $this->processDocument($document);

        return response()->json($document->fresh());
    }

    private function processDocument(Document $document): void
    {
        try {
            $fullPath = Storage::path($document->file_path);

            $parser = new PdfParser();
            $pdf = $parser->parseFile($fullPath);
            $pdfPages = $pdf->getPages();

            $pages = [];
            foreach ($pdfPages as $index => $page) {
                $pages[] = [
                    'page' => $index + 1,
                    'text' => $page->getText(),
                ];
            }

            $chunks = $this->chunker->chunkPages($pages);

            // Embed per-batch biar hemat request ke API
            $texts = array_column($chunks, 'content');
            $embeddings = $this->embedder->embedBatch($texts);

            foreach ($chunks as $i => $chunk) {
                $document->chunks()->create([
                    'chunk_index' => $i,
                    'page' => $chunk['page'],
                    'content' => $chunk['content'],
                    'embedding' => $embeddings[$i],
                ]);
            }

            $document->update([
                'status' => 'ready',
                'page_count' => count($pages),
            ]);
        } catch (\Throwable $e) {
            report($e);
            $document->update(['status' => 'failed']);
        }
    }

    public function destroy(Document $document)
    {
        Storage::delete($document->file_path);
        $document->delete();

        return response()->noContent();
    }
}
