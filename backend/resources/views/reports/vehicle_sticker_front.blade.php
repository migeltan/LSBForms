<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Vehicle Sticker — {{ $applicant->full_name }}</title>

    <style>
        /*
         * Standard windshield decal size: 3in x 5in (76.2mm x 127mm),
         * matching the artwork's ~0.596 aspect ratio. Only the control
         * number changes per record — everything else (seal, chevrons,
         * BGEN signature) is baked into vehicle-sticker-blank.png.
         */
        @page {
            size: 76.2mm 127mm;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        .sticker {
            position: relative;
            width: 76.2mm;
            height: 127mm;
            overflow: hidden;
            background-image: url('{{ $templateSrc }}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
        }

        .control-number {
            position: absolute;
            left: {{ $layout['cn']['x'] }}%;
            top: {{ $layout['cn']['y'] }}%;
            width: {{ $layout['cn']['w'] }}%;
            height: {{ $layout['cn']['h'] }}%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 700;
            font-size: {{ $layout['cn']['font'] }}mm;
            color: #1a1a1a;
        }
    </style>
</head>

<body>

    <div class="sticker">
        <div class="control-number">{{ $controlNumber }}</div>
    </div>

</body>

</html>