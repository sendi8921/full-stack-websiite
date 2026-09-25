<?php

namespace App\Services;

class ChunkingService
{
    /**
     * Pecah teks per halaman jadi potongan-potongan kecil (chunk).
     *
     * @param array $pages  ['page' => int, 'text' => string][]
     * @param int   $chunkSize    Panjang karakter per chunk
     * @param int   $overlap      Jumlah karakter yang overlap antar chunk,
     *                            supaya konteks kalimat yang "terpotong" di
     *                            batas chunk tidak hilang sepenuhnya.
     *
     * @return array ['page' => int, 'content' => string][]
     */
    public function chunkPages(array $pages, int $chunkSize = 800, int $overlap = 150): array
    {
        $chunks = [];

        foreach ($pages as $pageData) {
            $text = trim(preg_replace('/\s+/', ' ', $pageData['text']));
            if ($text === '') {
                continue;
            }

            $start = 0;
            $length = mb_strlen($text);

            while ($start < $length) {
                $piece = mb_substr($text, $start, $chunkSize);
                $chunks[] = [
                    'page' => $pageData['page'],
                    'content' => trim($piece),
                ];

                // maju sejauh (chunkSize - overlap), bukan chunkSize penuh
                $start += ($chunkSize - $overlap);
            }
        }

        return $chunks;
    }
}
