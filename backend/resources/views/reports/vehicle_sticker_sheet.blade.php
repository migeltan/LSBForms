<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Vehicle Sticker Sheet</title>
    <style>
        @page {
            size: {{ $pageW }}mm {{ $pageH }}mm;
            margin: 0;
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        /* 0.6mm shorter than the paper so Chrome never adds a blank last page */
        .page {
            width: {{ $pageW }}mm;
            height: {{ $pageH - 0.6 }}mm;
            padding: {{ $margin }}mm;
            display: grid;
            grid-template-columns: repeat({{ $cols }}, {{ $stickerW }}mm);
            grid-auto-rows: {{ $stickerH }}mm;
            gap: {{ $gap }}mm;
            justify-content: center;
            align-content: center;
            overflow: hidden;
            page-break-after: always;
        }
        .page:last-child { page-break-after: auto; }

        .sticker {
            position: relative;
            width: {{ $stickerW }}mm;
            height: {{ $stickerH }}mm;
            background-image: url('{{ $templateSrc }}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            outline: 0.2mm dashed #b5b5b5;   /* cut guide, sits in the gap */
            outline-offset: 0.8mm;
        }

        .control-number {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 700;
            color: #1a1a1a;
        }
    </style>
</head>

<body>
    @foreach ($pages as $page)
        <div class="page">
            @foreach ($page as $s)
                <div class="sticker">
                    <div class="control-number"
                        style="left:{{ $s['layout']['cn']['x'] }}%;top:{{ $s['layout']['cn']['y'] }}%;width:{{ $s['layout']['cn']['w'] }}%;height:{{ $s['layout']['cn']['h'] }}%;font-size:{{ round($s['layout']['cn']['font'] * $scale, 2) }}mm;">
                        {{ $s['number'] }}
                    </div>
                </div>
            @endforeach
        </div>
    @endforeach
</body>

</html>