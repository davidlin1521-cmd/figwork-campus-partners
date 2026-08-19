"use client";

import { useEffect, useRef, useState } from "react";

const TALLY_FORM_URL = "5Baz1o"; // Approved form: https://tally.so/r/5Baz1o
const TALLY_PUBLIC_URL = `https://tally.so/r/${TALLY_FORM_URL}`;
const CONTACT_EMAIL = "contact email placeholder"; // TODO: CONTACT_EMAIL — replace with the approved Figwork contact address.

const steps = [
  {
    number: "01",
    title: "Share your link.",
    body: "Find your personal referral link in your Figwork account. It is how we know who you brought in.",
  },
  {
    number: "02",
    title: "They activate.",
    body: "When someone you referred installs the Chrome extension and uploads their resume, that's a verified activation.",
  },
  {
    number: "03",
    title: "You get paid.",
    body: "Cash for every verified activation, after a short verification hold. Watch each referral's progress in your tracker.",
  },
];

const benefits = [
  {
    title: "Cash per activation",
    body: "Open referral participants earn $5 per verified activation. Selected Campus Growth Partners earn $10.",
    accent: "rust",
  },
  {
    title: "Real campaign budgets",
    body: "Pitch us a campus event — pizza for your club's study night, a table at the career fair. If we fund it, we pay the vendor directly. You run the event.",
    accent: "sage",
  },
  {
    title: "The title and the kit",
    body: "Campus Growth Partner at a funded startup, plus a welcome kit.",
    accent: "steel",
  },
  {
    title: "Your own numbers",
    body: "A live tracker of everything you drove. Real acquisition results you generated — strong material for any growth or marketing application.",
    accent: "ochre",
  },
];

const benefitsUpdated = [
  {
    title: "Run your own campaign",
    body: "Choose where and how Figwork shows up, from clubs and study groups to career communities.",
    accent: "rust",
  },
  {
    title: "Pitch a real idea",
    body: "Pitch a study night, workshop, or campus event. If approved, Figwork pays the vendor and you run it.",
    accent: "sage",
  },
  {
    title: "Build growth skills",
    body: "Practice outreach, campaign planning, positioning, and conversion with a live product.",
    accent: "steel",
  },
  {
    title: "Track your impact",
    body: "Use your tracker to follow the activations and acquisition results you generated.",
    accent: "ochre",
  },
  {
    title: "Get the title and kit",
    body: "Selected students can use the Campus Growth Partner title and receive the Figwork brand kit.",
    accent: "rust",
  },
  {
    title: "Earn for verified growth",
    body: "Campus Growth Partners earn $10 per verified activation. Open referral participants earn $5.",
    accent: "sage",
  },
];

const campusMoves = [
  {
    number: "01",
    title: "Bring it to your circles.",
    body: "Clubs, study groups, career communities — share Figwork where it can actually help.",
  },
  {
    number: "02",
    title: "Pitch a campus moment.",
    body: "Have an idea for a study night or campus event? Pitch it. If we fund it, Figwork pays the vendor and you run the moment.",
  },
  {
    number: "03",
    title: "Watch what you started move.",
    body: "Your tracker follows each activation from first click to paid — a live record of what you made happen.",
  },
];

const faq = [
  {
    question: "Who is this application for?",
    answer:
      "This application is only for students who want to be selected as Campus Growth Partners. Selected Partners may use the Campus Growth Partner title, receive the brand kit, and propose campus events for Figwork to fund.",
  },
  {
    question: "Do I need to apply to earn referral rewards?",
    answer:
      "No. Anyone who meets the referral eligibility requirements can use their personal Figwork referral link and earn cash. Open referral participants are not Campus Growth Partners and do not receive the Campus Growth Partner title or brand kit.",
  },
  {
    question: "How much can I earn?",
    answer:
      "The current rate is $5 per verified activation through the open referral program and $10 for selected Campus Growth Partners. The same annual reward limit applies to both; see the terms and conditions for details.",
  },
  {
    question: "When do I get paid?",
    answer:
      "After each activation clears a short verification hold. Payouts are pushed to you — you never have to invoice or ask.",
  },
  {
    question: "Do I have to post on social media?",
    answer:
      "No. Nothing is required. If you do post about Figwork, you have to say you're in the program — we'll show you how.",
  },
  {
    question: "What's the catch?",
    answer:
      "There isn't one. Rewards are based on verified activations, fraudulent activity is not eligible, and recruiting other referrers never earns a reward.",
  },
  {
    question: "Is this employment?",
    answer:
      "No. It's a program with no schedules and no duties. It doesn't create an employment relationship, and we're careful to keep it that way.",
  },
];

const stages = [
  "link clicked",
  "installed",
  "resume uploaded",
  "in hold",
  "paid",
];

const referrals = [
  { initials: "KL", stage: 1 },
  { initials: "AM", stage: 2 },
  { initials: "RS", stage: 0 },
  { initials: "JP", stage: 3 },
];

function Stamp({
  label,
  tone = "rust",
  className = "",
}: {
  label: string;
  tone?: "rust" | "cream" | "charcoal";
  className?: string;
}) {
  const pathId = `stamp-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return (
    <svg
      className={`stamp stamp--${tone} ${className}`}
      viewBox="0 0 160 160"
      role="img"
      aria-label={label}
    >
      <defs>
        <path
          id={pathId}
          d="M 18,80 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
        />
      </defs>
      <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="80" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fill="currentColor">
        <textPath href={`#${pathId}`} startOffset="3%">
          {label} · {label} ·
        </textPath>
      </text>
      <circle cx="80" cy="80" r="5" fill="currentColor" />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function Tracker() {
  return (
    <div className="tracker tracker--advanced">
      <div className="tracker__topline">
        <div>
          <span className="tracker__eyebrow">your tracker</span>
          <h3>Referral progress</h3>
        </div>
        <span className="preview-tag">preview</span>
      </div>
      <div className="tracker__labels" aria-hidden="true">
        <span>referral</span>
        <span>current stage</span>
      </div>
      <div className="tracker__rows">
        {referrals.map((referral, index) => {
          const nextStage = referral.stage;
          return (
            <div
              className="tracker__row"
              data-stage={stages[nextStage]}
              key={referral.initials}
              style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
            >
              <span className="initials">{referral.initials}</span>
              <div className="stage-wrap">
                <span className="stage-pill" data-stage={stages[nextStage]}>{stages[nextStage]}</span>
                <span className="stage-line" aria-hidden="true">
                  <i style={{ "--progress": `${(nextStage + 1) * 20}%` } as React.CSSProperties} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="tracker__note">Each row moves as an activation is verified.</p>
    </div>
  );
}

export default function Home() {
  const [copyVersion, setCopyVersion] = useState<"original" | "updated">("updated");
  const [isPdfExport, setIsPdfExport] = useState(false);
  const isUpdated = copyVersion === "updated";
  const visibleBenefits = isUpdated ? benefitsUpdated : benefits;

  useEffect(() => {
    const exporting = new URLSearchParams(window.location.search).has("pdf");
    setIsPdfExport(exporting);
    document.documentElement.classList.toggle("pdf-export-root", exporting);
    return () => document.documentElement.classList.remove("pdf-export-root");
  }, []);
  const tallyEmbedUrl =
    TALLY_FORM_URL === "TALLY_FORM_URL"
      ? null
      : `https://tally.so/embed/${TALLY_FORM_URL}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <main className={`mode--light energy--studio background--wash wash--strong accents--solid ${isPdfExport ? "pdf-export" : ""}`}>
      {!isPdfExport && <div className="copy-switcher" role="group" aria-label="Compare page wording">
        <span>Page copy</span>
        <button
          type="button"
          aria-pressed={!isUpdated}
          onClick={() => setCopyVersion("original")}
        >
          Original
        </button>
        <button
          type="button"
          aria-pressed={isUpdated}
          onClick={() => setCopyVersion("updated")}
        >
          Benefits edit
        </button>
      </div>}
      <section
        className="hero"
        id="top"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          event.currentTarget.style.setProperty("--signal-x", `${x * 32}px`);
          event.currentTarget.style.setProperty("--signal-y", `${y * 24}px`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--signal-x", "0px");
          event.currentTarget.style.setProperty("--signal-y", "0px");
        }}
      >
        <header className="site-header">
          {/* TODO: LOGO_ASSET — replace this placeholder with the official SVG, unmodified. */}
          <div className="logo-placeholder" aria-label="Figwork logo placeholder">
            LOGO ASSET
          </div>
          <a className="button button--glow button--small" href={TALLY_PUBLIC_URL} target="_blank" rel="noreferrer">
            Apply now
          </a>
        </header>

        <div className="hero__grid">
          <div className="hero__title-block">
            <p className="kicker kicker--cream">FIGWORK CAMPUS GROWTH PARTNERS</p>
            <h1>
              Run <span className="outline-word">growth</span> for a real startup. On your campus.
            </h1>
          </div>
          <div className="hero__copy">
            <p>
              {isUpdated
                ? "Figwork helps students find the recruiter behind a career posting. Bring it to your campus, run a real campaign, and track what you make happen."
                : "Figwork finds the actual recruiter behind career postings. We’re picking 2–3 students at each of a handful of universities to help it spread — and paying for every person you bring in."}
            </p>
            <div className="hero__actions">
              <a className="button button--glow" href={TALLY_PUBLIC_URL} target="_blank" rel="noreferrer">
                Apply now
              </a>
              <a className="text-link" href="#how-it-works">
                How it works ↓
              </a>
              <a className="button button--terms" href="/terms">
                Terms and conditions →
              </a>
            </div>
          </div>
          <Stamp label="PAID PER ACTIVATION" tone="cream" className="hero-stamp" />
        </div>
        <div className="signal-field" aria-hidden="true">
          <span className="signal-ring signal-ring--1" />
          <span className="signal-ring signal-ring--2" />
          <span className="signal-ring signal-ring--3" />
          <span className="signal-core" />
        </div>
      </section>

      <section className="section section--how" id="how-it-works">
        <div className="section-number" aria-hidden="true">01</div>
        <Reveal className="section-heading section-heading--offset">
          <p className="kicker">HOW REFERRALS WORK</p>
          <h2>How it works</h2>
          <p className="section-intro">A simple path from your link to a verified result.</p>
        </Reveal>

        <div className="process-grid">
          {steps.map((step, index) => (
            <Reveal className={`process-card process-card--${index + 1}`} key={step.number}>
              <span className="card-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="tracker-wrap">
          <Tracker />
          <Stamp label="FALL / WINTER COHORT" className="tracker-stamp" />
        </Reveal>
      </section>

      <section className="section section--benefits" id="benefits">
        <div className="section-number section-number--right" aria-hidden="true">02</div>
        <Reveal className="section-heading section-heading--benefits">
          <p className="kicker">{isUpdated ? "WHAT YOU’LL BUILD" : "WHAT PARTNERS GET"}</p>
          <h2>{isUpdated ? "Your campaign. Your results." : "Proof you can point to."}</h2>
        </Reveal>
        <div className="benefit-grid">
          {visibleBenefits.map((benefit, index) => (
            <Reveal className={`benefit-card benefit-card--${index + 1}`} key={benefit.title}>
              <div className="benefit-card__topline">
                <span className={`accent-line accent-line--${benefit.accent}`} />
                <span className="benefit-index">0{index + 1}</span>
              </div>
              <div className="benefit-card__copy">
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--playbook">
        <div className="section-number" aria-hidden="true">03</div>
        <Reveal className="playbook-heading">
          <p className="kicker">YOUR CAMPUS, YOUR PLAYBOOK</p>
          <h2>Turn your campus into your campaign.</h2>
          <p>Start with what you already know: your people, your places, your ideas.</p>
        </Reveal>
        <div className="playbook-list">
          {campusMoves.map((move) => (
            <Reveal className="playbook-item" key={move.number}>
              <span className="playbook-item__number">{move.number}</span>
              <div>
                <h3>{move.title}</h3>
                <p>{move.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mid-page-cta">
          <p className="kicker kicker--cream">FALL / WINTER COHORT</p>
          <h2>Bring Figwork to your campus.</h2>
          <a className="button button--glow" href={TALLY_PUBLIC_URL} target="_blank" rel="noreferrer">Apply now</a>
        </Reveal>
      </section>

      <section className="section section--faq" id="faq">
        <div className="section-number section-number--right" aria-hidden="true">04</div>
        <Reveal className="faq-layout">
          <div className="faq-title">
            <p className="kicker">PROGRAM QUESTIONS</p>
            <h2>Questions, answered.</h2>
            <Stamp label="NO SCHEDULES NO QUOTAS" tone="charcoal" className="faq-stamp" />
          </div>
          <div className="faq-list">
            {faq.map((item) => (
              <details key={item.question} open={isPdfExport || undefined}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
            <details className="program-notes" open={isPdfExport || undefined}>
              <summary>Program notes<span aria-hidden="true">+</span></summary>
              <div className="program-notes__body">
                <p>No schedules, no quotas, no scripts. You decide what to do and when.</p>
                <p>Not employment — a program. There’s nothing to clock into and nobody to report to.</p>
                <p>You earn from results, and results only.</p>
              </div>
            </details>
          </div>
        </Reveal>
      </section>

      <section className="application" id="application">
        <div className="section-number" aria-hidden="true">05</div>
        <Reveal className="application__grid">
          <div className="application__copy">
            <p className="kicker kicker--cream">FALL / WINTER COHORT</p>
            <h2>Apply for fall/winter</h2>
            <p>This application is only for Campus Growth Partners. The open referral program does not require an application.</p>
            <p>Short written application. No resume, no calls — we read what you’ve organized and what you’d do here.</p>
            <p className="application__dates">Applications close November 1. Decisions by December 1.</p>
            <a className="application__terms-link" href="/terms">Terms and conditions →</a>
          </div>
          <div className="form-shell">
            {tallyEmbedUrl ? (
              <iframe
                data-tally-src={tallyEmbedUrl}
                src={tallyEmbedUrl}
                title="Figwork Campus Growth Partners application"
                loading="lazy"
                width="100%"
                height="520"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
              />
            ) : (
              <div className="form-placeholder">
                <span>TALLY FORM</span>
                <p>Application embed ready for the approved URL.</p>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <footer>
        <p>Figwork Campus Growth Partners · {CONTACT_EMAIL} · <a href="/terms">Terms and conditions</a> · This page describes a program, not employment.</p>
        <div className="footer-links">
          <a className="pdf-download-link" href="/downloads/figwork-campus-growth-partners.pdf" download>Download page PDF ↓</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
