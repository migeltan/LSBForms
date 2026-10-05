<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#1f2937;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#1e3a5f;margin:0 0 16px">Legislative Security Bureau</h2>
  <p>Hello {{ $applicantName }},</p>

  @if ($event === 'submitted')
    <p>We received your {{ $formType }} application. Keep your reference number, you will need it to check your application status.</p>
  @elseif ($event === 'Approved')
    <p>Your {{ $formType }} application has been <strong>approved</strong>.</p>
  @elseif ($event === 'Rejected')
    <p>Your {{ $formType }} application was <strong>not approved</strong>.</p>
  @else
    <p>Your {{ $formType }} application needs <strong>corrections or a retake</strong> before we can continue. Please see the notes below.</p>
  @endif

  <p style="background:#f3f4f6;border-radius:8px;padding:12px 16px;font-size:18px;letter-spacing:1px">
    Reference No.: <strong>{{ $referenceNumber }}</strong>
  </p>

  @if ($remarks && $event !== 'submitted')
    <p><strong>Reviewer remarks:</strong><br>{{ $remarks }}</p>
  @endif

  <p style="color:#6b7280;font-size:12px">This is an automated message. Please do not reply.</p>
</body>
</html>