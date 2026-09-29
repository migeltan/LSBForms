<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Access Pass — {{ $applicant->full_name }}</title>

    <style>
        /*
         * Physical card size: 74mm x 105mm. Field positions/sizes are NOT
         * hardcoded here anymore — they come from App\Support\AccessPassLayout
         * (template defaults) merged with the application's saved
         * layout_overrides (admin layout editor), and are applied as inline
         * styles on each field below. This CSS only handles look, not place.
         */
        @page {
            size: 74mm 105mm;
            margin: 0;
        }

        @font-face {
            font-family: 'Bebas Neue';
            src: url('{{ $assets['bebasFont'] ?? asset('fonts/BebasNeue-Regular.ttf') }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
        }

        .card {
            position: relative;
            width: 74mm;
            height: 105mm;
            overflow: hidden;
            background-image: url('{{ $templateSrc }}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            font-family: Georgia, 'Times New Roman', serif;
        }

        .field {
            position: absolute;
            display: flex;
            align-items: center;
            overflow: hidden;
        }

        .photo {
            background-color: #eef1f5;
            background-size: cover;
            background-position: center;
            justify-content: center;
            font-size: 2.2mm;
            color: #98a4b3;
            text-align: center;
            border-radius: 1mm;
            border: 0.3mm solid #1a1a1a;
        }

        .cn-value {
            font-family: Georgia, 'Times New Roman', serif;
            font-weight: bold;
            color: #1a1a1a;
            letter-spacing: 0.2px;
            white-space: nowrap;
        }

        .name,
        .department {
            font-family: 'Bebas Neue', Arial, sans-serif;
            line-height: 1;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .signature-img {
            justify-content: center;
        }

        .signature-img img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .bar-text {
            left: 0;
            top: 89.59%;
            width: 100%;
            height: 6.89%;
            justify-content: center;
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: 5.2mm;
            letter-spacing: 3px;
            color: #ffffff;
            text-transform: uppercase;
        }
    </style>
</head>

<body>

    @php
        $photoSrc = $photoSrc ?? null;
        $signatureSrc = $signatureSrc ?? null;
        $photoStyle = $photoSrc ? "background-image:url('{$photoSrc}');" : '';

        // Template defaults + this application's saved admin tweaks.
        $layoutSource = ($application ?? $applicant->accessPassApplication)?->layout_overrides;
        $L = \App\Support\AccessPassLayout::resolve($layoutSource);

        $box = function (string $field) use ($L) {
            $b = $L[$field];
            $css = "left:{$b['x']}%;top:{$b['y']}%;width:{$b['w']}%;height:{$b['h']}%;";
            if (isset($b['font'])) {
                $css .= "font-size:{$b['font']}mm;";
            }

            return $css;
        };
    @endphp

    <div class="card">
        <div class="field photo" style="{{ $box('photo') }}{{ $photoStyle }}">
            @unless ($photoSrc)
                NO PHOTO
            @endunless
        </div>

        <div class="field cn-value" style="{{ $box('cn') }}">{{ $controlNumber ?? '—' }}</div>

        <div class="field name" style="{{ $box('name') }}">{{ strtoupper($applicant->full_name) }}</div>

        <div class="field department" style="{{ $box('department') }}">{{ $department ?? 'Legislative Security Bureau' }}</div>

        <div class="field signature-img" style="{{ $box('signature') }}">
            @if ($signatureSrc)
                <img src="{{ $signatureSrc }}" alt="Signature">
            @endif
        </div>

        <div class="field bar-text">{{ $category ?? 'Security' }}</div>
    </div>

</body>

</html>