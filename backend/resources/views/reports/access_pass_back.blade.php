<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Access Pass (Back) — {{ $applicant->full_name }}</title>

    <style>
        /*
         * Back side of the 74mm x 105mm access pass. No template PNG yet —
         * this design isn't finalized (per Misty: "no info abt this yet,
         * just put something you'd typically see"). Plain HTML/CSS for now
         * so it's easy to swap for a real design later; nothing here reads
         * per-applicant data except the issuing office, which is static.
         */
        @page {
            size: 74mm 105mm;
            margin: 0;
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
            background: #ffffff;
            font-family: Georgia, 'Times New Roman', serif;
            color: #1a1a1a;
            padding: 5mm 5.5mm;
        }

        .seal {
            display: block;
            width: 11mm;
            height: 11mm;
            margin: 0 auto 2mm;
        }

        .heading {
            text-align: center;
            font-size: 2.6mm;
            font-weight: bold;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #a52d22;
        }

        .subheading {
            text-align: center;
            font-size: 2.1mm;
            color: #4a4a4a;
            margin-top: 0.6mm;
            margin-bottom: 4mm;
        }

        .rule {
            border: none;
            border-top: 0.3mm solid #a52d22;
            margin: 3mm 0;
        }

        .notice {
            font-size: 2.35mm;
            line-height: 1.55;
            text-align: justify;
        }

        .notice + .notice {
            margin-top: 2.5mm;
        }

        .notice strong {
            color: #a52d22;
        }

        .return-block {
            margin-top: 4mm;
            font-size: 2.2mm;
            line-height: 1.5;
            text-align: center;
        }

        .return-block .label {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 2mm;
            color: #6a6a6a;
        }

        .sign-block {
            position: absolute;
            left: 5.5mm;
            right: 5.5mm;
            bottom: 8mm;
            text-align: center;
        }

        .sign-line {
            border-top: 0.25mm solid #1a1a1a;
            width: 44mm;
            margin: 0 auto;
        }

        .sign-caption {
            font-size: 1.9mm;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #6a6a6a;
            margin-top: 1mm;
        }

        .footer-strip {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 4mm;
            background: #a52d22;
        }
    </style>
</head>

<body>

    <div class="card">
        <img class="seal" src="{{ $sealSrc }}" alt="">
        <div class="heading">House of Representatives</div>
        <div class="subheading">Legislative Security Bureau</div>

        <hr class="rule">

        <div class="notice">
            <strong>This pass is the property of the House of Representatives</strong> and is
            non-transferable. It must be worn, face-out, above the waist at all times while
            inside House premises.
        </div>
        <div class="notice">
            The bearer agrees to comply with all security procedures of the Legislative Security
            Bureau. This pass may be confiscated and access revoked for misuse, tampering, or
            failure to present valid identification upon request.
        </div>

        <div class="return-block">
            <div class="label">If found, please return to</div>
            Legislative Security Bureau<br>
            House of Representatives, Batasan Complex<br>
            Constitution Hills, Quezon City
        </div>

        <div class="sign-block">
            <div class="sign-line"></div>
            <div class="sign-caption">Issuing Officer</div>
        </div>

        <div class="footer-strip"></div>
    </div>

</body>

</html>