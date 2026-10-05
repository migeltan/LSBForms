<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    // Local dev: Vite may run on 127.0.0.1 or a different port (5174, ...).
    'allowed_origins_patterns' => env('APP_ENV') === 'local'
        ? ['#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#']
        : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition', 'X-Batch-Total', 'X-Batch-Added'],

    'max_age' => 0,

    'supports_credentials' => true,

];
