// src/components/ContactSection.tsx
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const CONTACT_TILES = [
  {
    icon: MapPin,
    label: "Office Address",
    value: "[OFFICIAL OFFICE ADDRESS TO BE CONFIRMED]",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "[OFFICIAL CONTACT NUMBER TO BE CONFIRMED]",
  },
  {
    icon: Mail,
    label: "Email",
    value: "[OFFICIAL EMAIL ADDRESS TO BE CONFIRMED]",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "[OFFICIAL OFFICE HOURS TO BE CONFIRMED]",
  },
];

export function ContactSection() {
  return (
    <div className="contact-section form-section-card landing-card corner-accent-yellow">
      <div className="section-label">Need Help?</div>
      <h2 style={{ fontSize: "1.1rem" }}>Contact / Inquiries</h2>
      <p className="mb-0 text-sm text-[var(--smart-muted)]">
        Reach the Internal Security Group directly for questions about your
        application.
      </p>

      <div className="contact-grid">
        {CONTACT_TILES.map(({ icon: Icon, label, value }) => (
          <div className="contact-tile" key={label}>
            <span className="contact-tile-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div>
              <div className="contact-tile-label">{label}</div>
              <div className="contact-tile-value">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
