<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ApplicationStatusMail extends Mailable
{
    public function __construct(
        public string $applicantName,
        public string $referenceNumber,
        public string $formType,   // 'Access Pass' | 'Vehicle Sticker'
        public string $event,      // 'submitted' | 'Approved' | 'Rejected' | 'Incomplete/Returned'
        public ?string $remarks = null,
    ) {}

    public function envelope(): Envelope
    {
        $ref = $this->referenceNumber;

        return new Envelope(subject: match ($this->event) {
            'submitted' => "We received your {$this->formType} application ({$ref})",
            'Approved' => "Your {$this->formType} application was approved ({$ref})",
            'Rejected' => "Your {$this->formType} application was not approved ({$ref})",
            default => "Action needed on your {$this->formType} application ({$ref})",
        });
    }

    public function content(): Content
    {
        return new Content(view: 'emails.application-status');
    }
}