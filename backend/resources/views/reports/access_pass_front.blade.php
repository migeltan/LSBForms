<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Access Pass — {{ $applicant->full_name }}</title>

    <style>
        /*
         * Physical card size: 74mm x 105mm (see App\Service\IdCardService /
         * PdfGeneratorService::ACCESS_PASS_*_MM). Built in real mm units
         * rather than a scaled px canvas — no design-canvas transform
         * needed since every position below already matches the card's
         * true physical proportions (measured directly off the reference
         * artwork in Access_Pass.png).
         *
         * This view renders ONE card. The 2x2-per-Letter-sheet layout with
         * cut marks lives one level up, in reports.access_pass_sheet, which
         * @includes this view four times inside positioned wrapper cells.
         * Standalone preview/download of a single card still works — see
         * $standalone below.
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
            left: 33.72%;
            top: 35.29%;
            width: 32.55%;
            height: 24.33%;
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
            left: 6.74%;
            top: 56.4%;
            width: 22.97%;
            height: 3.1%;
            font-family: Georgia, 'Times New Roman', serif;
            font-weight: bold;
            font-size: 4.6mm;
            color: #1a1a1a;
            letter-spacing: 0.2px;
        }

        .name {
            left: 17.99%;
            top: 63.6%;
            width: 64.52%;
            height: 6.48%;
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: 6.4mm;
            line-height: 1;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .department {
            left: 19.94%;
            top: 70.6%;
            width: 60.12%;
            height: 4.69%;
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: 3.6mm;
            line-height: 1;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .signature-img {
            left: 30%;
            top: 76.2%;
            width: 40%;
            height: 8%;
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
        $photoStyle = $photoSrc ? "background-image:url('{$photoSrc}');" : '';
    @endphp

    <div class="card">
        <div class="field photo" style="{{ $photoStyle }}">
            @unless ($photoSrc)
                NO PHOTO
            @endunless
        </div>

        <div class="field cn-value">{{ $controlNumber ?? '—' }}</div>

        <div class="field name">{{ strtoupper($applicant->full_name) }}</div>

        <div class="field department">{{ $department ?? 'Legislative Security Bureau' }}</div>

        <div class="field signature-img">
            @if ($signatureSrc)
                <img src="{{ $signatureSrc }}" alt="Signature">
            @endif
        </div>

        <div class="field bar-text">{{ $category ?? 'Security' }}</div>
    </div>

</body>

</html>