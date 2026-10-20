// Home.tsx
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ClipboardList,
  FileCheck2,
  ArrowUpRight,
} from "lucide-react";
import { FormsSearch } from "../components/FormsSearch";
import { StatusCheckCard } from "../components/StatusCheckCard";
import { ContactSection } from "../components/ContactSection";
import { AVAILABLE_FORMS, type FormDefinition } from "../data/forms";
import { useInView } from "../hooks/useInView";
import { useScrollProgress } from "../hooks/useScrollProgress";

export function Home() {
  const [heroRef, heroProgress] = useScrollProgress<HTMLDivElement>();
  const { ref: bentoRef, inView: bentoInView } = useInView<HTMLDivElement>({
    threshold: 0.05,
  });
  const [activePanel, setActivePanel] = useState<"instructions" | "docs">(
    "instructions",
  );
  const { ref: beforeBeginRef, inView: beforeBeginInView } =
    useInView<HTMLDivElement>({ threshold: 0.05 });
  const { ref: instructionsPanelRef, inView: instructionsPanelInView } =
    useInView<HTMLDivElement>();
  const { ref: docsPanelRef, inView: docsPanelInView } =
    useInView<HTMLDivElement>();
  const { ref: contactRef, inView: contactInView } =
    useInView<HTMLDivElement>();

  const heroInnerStyle = {
    opacity: Math.max(1 - heroProgress * 1.6, 0),
    transform: `translateY(${heroProgress * 36}px) scale(${1 - heroProgress * 0.05})`,
  };

  return (
    <>
      {/* HERO — encapsulates the top of the page, fades/settles as the
          user starts scrolling into the bento grid below. */}
      <section className="hero-landing" ref={heroRef}>
        <div className="hero-landing-inner" style={heroInnerStyle}>
          <div className="hero-landing-text">
            <h1 className="hero-landing-title">
              <span className="hero-landing-title-eyebrow">LSBForms:</span>
              <span className="hero-landing-title-main">
                Digital Application Form
              </span>
            </h1>
            <p className="hero-landing-lead">
              Access the online application portal for Legislative Security
              Bureau concerned documents.{" "}
              <strong>Anytime, anywhere, in your comfort.</strong>
            </p>
          </div>
          <div className="hero-landing-graphic" aria-hidden="true">
            <img
              src="/images/inspire-logo.png"
              alt=""
              className="hero-landing-graphic-img"
            />
          </div>
        </div>
        <div className="hero-landing-scroll-cue" aria-hidden="true">
          <ChevronDown strokeWidth={2.5} />
        </div>
      </section>

      {/* BENTO GRID — search, the two application cards, and the inline
          status check, all revealed together as they scroll into view. */}
      <section
        className={`bento-section reveal${bentoInView ? " is-visible" : ""}`}
        ref={bentoRef}
      >
        <FormsSearch />

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {AVAILABLE_FORMS.map((form) => (
            <ApplicationCard key={form.id} form={form} />
          ))}
        </div>

        <StatusCheckCard />
      </section>

      {/* BEFORE YOU BEGIN — sticky label on the left, Instructions and
          Required Documents scroll past it on the right. */}
      <section
        className={`before-begin-section reveal${beforeBeginInView ? " is-visible" : ""}`}
        ref={beforeBeginRef}
      >
        <div className="before-begin-sticky-col">
          <div className="before-begin-sticky-inner">
            <div className="before-begin-kicker">Before you begin:</div>
            <h2 className="before-begin-heading">Prepare the following</h2>
          </div>
        </div>

        <div className="before-begin-panels">
          <div className="bb-tabs" role="tablist" aria-label="Before you begin">
            <button
              type="button"
              role="tab"
              id="bb-tab-instructions"
              aria-selected={activePanel === "instructions"}
              aria-controls="bb-panel-instructions"
              className="bb-tab"
              onClick={() => setActivePanel("instructions")}
            >
              <ClipboardList size={20} aria-hidden="true" />
              <span className="bb-tab__title">Instructions</span>
              <span className="bb-tab__hint">How to prepare</span>
            </button>
            <button
              type="button"
              role="tab"
              id="bb-tab-docs"
              aria-selected={activePanel === "docs"}
              aria-controls="bb-panel-docs"
              className="bb-tab bb-tab--red"
              onClick={() => setActivePanel("docs")}
            >
              <FileCheck2 size={20} aria-hidden="true" />
              <span className="bb-tab__title">Required Documents</span>
              <span className="bb-tab__hint">What to bring</span>
            </button>
          </div>

          <div
            id="bb-panel-instructions"
            role="tabpanel"
            aria-labelledby="bb-tab-instructions"
            className={`before-begin-panel form-section-card landing-card corner-accent-blue reveal${instructionsPanelInView ? " is-visible" : ""}${activePanel === "instructions" ? " is-active" : ""}`}
            ref={instructionsPanelRef}
          >
            <div className="section-label">
              <ClipboardList size={18} aria-hidden="true" />
              Instructions
            </div>
            <ul className="mb-0 list-disc space-y-1 pl-10 text-[var(--smart-muted)]">
              <li>
                Prepare <strong>clear, readable scans</strong> of your documents
                (JPG, PNG or PDF, up to <strong>10 MB</strong> each)
              </li>
              <li>
                <strong>Recent White Background Photo</strong> photo ready,
                plain background, face clearly visible
              </li>
              <li>
                IDs must be <strong>valid (not expired)</strong>, and your name
                should match across all documents
              </li>
              <li>
                Submitting does not mean automatic approval, this is subject to
                the <strong>Internal Security Group</strong>
              </li>
              <li>
                Keep your <strong>reference number</strong> to check your
                application status later
              </li>
            </ul>
            <button type="button" className="btn btn-govt-info">
              View Reference Files
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div
            id="bb-panel-docs"
            role="tabpanel"
            aria-labelledby="bb-tab-docs"
            className={`before-begin-panel form-section-card landing-card corner-accent-red reveal${docsPanelInView ? " is-visible" : ""}${activePanel === "docs" ? " is-active" : ""}`}
            ref={docsPanelRef}
          >
            <div className="section-label">
              <FileCheck2 size={18} aria-hidden="true" />
              Required Documents
            </div>
            <ul className="mb-0 list-disc space-y-1 pl-10 text-[var(--smart-muted)]">
              <li>
                <strong>Access Pass:</strong> Letter request addressed to the
                Sergeant-at-Arms
              </li>
              <li>
                <strong>Valid government-issued ID</strong> with photo and
                signature (front and back)
              </li>
              <li>NBI Clearance (non-plantilla applicants)</li>
              <li>Contract of Consultancy (consultant applicants)</li>
              <li>
                <strong>Vehicle Sticker:</strong> OR/CR, and Deed of Sale if the
                vehicle is not registered to you
              </li>
              <li>HRep ID</li>
              <li>
                Chattel Mortgage or Company/Secretary&apos;s Certificate, if
                applicable
              </li>
            </ul>
            <p className="mb-0 mt-2 text-[var(--smart-muted)]">
              Additional documents may be required depending on your applicant
              type.
            </p>
            <button type="button" className="btn btn-govt-info">
              View Reference Files
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
      {/* CONTACT */}
      <div
        ref={contactRef}
        className={`reveal${contactInView ? " is-visible" : ""}`}
      >
        <ContactSection />
      </div>
    </>
  );
}

/** Per-form bold-text description, matching the mockup's exact wording.
 *  Falls back to the plain registry summary for any future form that
 *  hasn't had custom copy written for it yet. */
function ApplicationCardDescription({
  form,
}: {
  form: FormDefinition;
}): ReactNode {
  if (form.id === "access-pass") {
    return (
      <>
        <span className="m-hide">
          For Congressional Staff, Consultant, Attached Agencies,
          Concessionaire, etc. Apply for an <strong>Access Pass.</strong>
        </span>
        <span className="m-only">
          For staff, consultants, agencies and more.
        </span>
      </>
    );
  }
  if (form.id === "vehicle-sticker") {
    return (
      <>
        <span className="m-hide">
          For House Employees applying for a <strong>Vehicle Sticker</strong>{" "}
          for their private vehicles in the HRep Premises.
        </span>
        <span className="m-only">
          For House employees&apos; private vehicles.
        </span>
      </>
    );
  }
  return <>{form.summary}</>;
}

function ApplicationCard({ form }: { form: FormDefinition }) {
  return (
    <div className={`app-choice-card corner-accent-${form.accent}`}>
      <div className="card-index">
        {form.index}
        <span className="m-hide"> Application Form</span>
      </div>
      <h3>{form.title}</h3>
      <p>
        <ApplicationCardDescription form={form} />
      </p>
      <Link
        to={form.href}
        className="block btn btn-govt-primary sm:inline-block"
      >
        <span className="m-hide">Start Application</span>
        <span className="m-only">Start</span>
        <span className="btn-arrow">
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
