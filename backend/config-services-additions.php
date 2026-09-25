<?php

// Tambahkan array ini ke dalam file config/services.php yang sudah ada
// (di dalam return [ ... ] yang paling luar)

'groq' => [
    'api_key' => env('GROQ_API_KEY'),
    'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
],

'embedding' => [
    'api_key' => env('EMBEDDING_API_KEY'),
    'base_url' => env('EMBEDDING_BASE_URL', 'https://api.openai.com/v1'),
    'model' => env('EMBEDDING_MODEL', 'text-embedding-3-small'),
],
