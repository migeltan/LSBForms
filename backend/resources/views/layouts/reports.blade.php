<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Access Pass ID — {{ $applicant->full_name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Tailwind-driven version. If this is compiled through your normal
         Tailwind build (content-scanned at build time), make sure this
         file's path is included in `content` in tailwind.config.js, and
         that any arbitrary-value classes used below (w-[380px], top-[40px],
         etc.) are either used literally here (so the JIT scanner picks
         them up) or added to a safelist — otherwise they'll silently emit
         no CSS, same failure mode as the note in the previous version. --}}
    @if ($forPdf)
        <style>
            {!! $assets['compiledCss'] !!}
        </style>
    @else
        <link rel="stylesheet" href="{{ asset('css/id-cards-compiled.css') }}">
    @endif

</head>

<body class="p-0 m-0 font-sans bg-slate-300">


</body>

</html>
