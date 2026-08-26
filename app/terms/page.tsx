"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./terms.css";

export default function TermsPage() {
  const searchParams = useSearchParams();
  const isPdfExport = searchParams.has("pdf");

  useEffect(() => {
    document.documentElement.classList.toggle("pdf-export-root", isPdfExport);
    return () => document.documentElement.classList.remove("pdf-export-root");
  }, [isPdfExport]);

  return (
    <main className={`terms-page ${isPdfExport ? "pdf-export" : ""}`}>
      <header className="terms-header">
        <Link className="terms-logo" href="/" aria-label="Back to the Figwork Student Ambassador Program">
          {/* Keep the supplied logo file unmodified instead of routing it through optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figwork-logo-light.png" alt="Figwork" />
        </Link>
        <div className="terms-header__links">
          <a className="terms-back" href="/student-ambassador-program">Back to program</a>
        </div>
      </header>

      <section className="terms-hero">
        <p className="terms-kicker">FIGWORK STUDENT AMBASSADOR PROGRAM</p>
        <h1>Terms and conditions.</h1>
        <p className="terms-deck">
          The rules for the Figwork referral program and selected campus partner program.
        </p>
      </section>

      <article className="terms-document" aria-labelledby="full-terms">
        <header className="terms-document__header">
          <h2 id="full-terms">The details, plainly.</h2>
          <p>
            These are the rules of the Figwork referral program and the selected Campus Partners / Student Ambassador Program. By joining either program - using a referral link to earn, or accepting a place in the selected program - you agree to them.
          </p>
        </header>

        <details className="term-section" id="what-the-program-is" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">01</span>
            <h3>What is the program?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>The open referral program is available to anyone who meets the eligibility requirements in Section 2. No Campus Growth Partner application is required. Find your personal referral link in your Figwork account and use it to earn cash rewards for verified activations.</li>
              <li>The application on the Campus Partners / Student Ambassador Program page is only for the selected program. Selected participants earn through the same referral program, may use an approved program title, receive the Figwork brand kit, and can propose campus events for Figwork to fund.</li>
              <li>Participating in the open referral program does not make someone a Campus Growth Partner, Campus Partner, or Student Ambassador. Open referral participants may not use any of these titles or represent that they are part of the selected program, and they do not receive the brand kit.</li>
              <li>This is not a job. Joining does not create an employment, contractor, or agency relationship with Figwork. There are no hours, duties, quotas, or required tasks, and nobody at Figwork will direct your activity.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="who-can-participate" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">02</span>
            <h3>Who can participate?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>You must be 18 or older.</li>
              <li>You must be physically located in the United States and may not participate while in the U.S. on an F-1 or J-1 student visa.</li>
              <li>You must have a valid U.S. taxpayer identification number and be able to complete a Form W-9 when asked.</li>
              <li>If you are a college athlete, you are responsible for any reporting your school or athletic association requires for deals and benefits.</li>
              <li>Figwork employees and their immediate family cannot earn referral rewards.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="verified-activation" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">03</span>
            <h3>What counts as a verified activation?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>A reward is earned when a person you referred, within 14 days of using your link, installs the Figwork Chrome extension, creates an account, uploads their resume, and is verified as a real, unique person.</li>
              <li>Installing Figwork by itself does not qualify as a verified activation. A reward may be earned only once for each eligible referred person; duplicate, shared, or fabricated accounts do not qualify.</li>
              <li>Referring means sharing your link yourself. Rewards are only paid for people you directly referred - never for people they refer, and never for recruiting other referrers.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="payment" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">04</span>
            <h3>How and when are rewards paid?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>The current open referral rate is $5 per verified activation. Selected Campus Growth Partners earn $10 per verified activation beginning on the date they are selected. The Campus Growth Partner rate applies only to referrals started on or after selection.</li>
              <li>These are the current rates. Figwork may change rates for future referrals with notice on this page, as described in Section 8. A rate change does not affect a referral already in progress.</li>
              <li>Total reward payments are capped at $2,000 per participant per calendar year. The same cap applies to open referral participants and Campus Growth Partners.</li>
              <li>Each reward is held for about 10 days while we verify the activation, then paid out to you. You do not need to invoice or request payment.</li>
              <li>If we find that a paid reward came from fraud or a fake account, we will deduct that amount from your future rewards, and we may remove you from the program.</li>
              <li>Rewards are cash only. We do not pay in gift cards, and the welcome kit is a gift, not payment.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="taxes" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">05</span>
            <h3>What should I know about taxes?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Reward payments are taxable income to you, whatever the amount. You are responsible for declaring and paying income tax on them.</li>
              <li>For payments made in 2026, if Figwork pays you $2,000 during the calendar year, Figwork will issue you a Form 1099-NEC. The IRS may adjust this reporting threshold in later years. Whether or not you receive a Form 1099-NEC, you are responsible for declaring and paying income tax on your rewards.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="posting" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">06</span>
            <h3>Do I have to post about Figwork?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>You never have to post anything. If you do post about Figwork anywhere - including tags, likes, and stories - you must clearly disclose your connection to the program in the post itself, for example: “I’m part of Figwork’s campus program and earn referral rewards.”</li>
              <li>This is a legal requirement under FTC rules, not a Figwork preference. Read the FTC’s “Disclosures 101 for Social Media Influencers” guide, which we provide to every participant.</li>
              <li>Never make claims about how much money the program pays, and never claim Figwork gets anyone hired.</li>
              <li>Do not post reviews of Figwork on the Chrome Web Store or app stores while you are in the program.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="sharing" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">07</span>
            <h3>How can I share my link?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Share your link personally, with people you actually know or meet. Never spam: no mass messages, no posting into groups that prohibit it, no automated sending, and never let anyone else send messages on your behalf.</li>
              <li>Figwork never sends messages to your contacts, and you may not represent otherwise.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="changes" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">08</span>
            <h3>Can the program or its terms change?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Figwork can change the reward rate, the limits, or any of these terms - or end the program - at any time, going forward, with notice on this page.</li>
              <li>Changes are never retroactive: a referral that was already in progress when the change was announced is paid under the terms that applied when the person clicked your link.</li>
              <li>Figwork can remove any participant for fraud, misrepresentation, spam, or violating these terms. Rewards already properly earned will still be paid.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="campus-partners" open={isPdfExport || undefined}>
          <summary>
            <span className="term-number">09</span>
            <h3>What titles may selected students use?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Students selected into the program may describe themselves as a Figwork Campus Growth Partner, Figwork Campus Partner, or Figwork Student Ambassador, including on a resume or professional profile.</li>
              <li>These titles are reserved for selected participants. Open referral participants may not use them or represent that they are part of the selected program.</li>
              <li>Each title is a program designation, not a position or title of employment at Figwork.</li>
              <li>Event proposals are voluntary. If Figwork approves a proposal, Figwork pays the vendor directly - Partners never receive or handle event money.</li>
              <li>The Figwork brand kit is a one-time gift available only to selected participants.</li>
            </ul>
          </div>
        </details>

        <footer className="terms-document__footer">
          <p>Questions about these terms: <a href="mailto:businessdevelopment@figwork.ai">businessdevelopment@figwork.ai</a></p>
          <p>Effective date: <span className="terms-placeholder">[DATE]</span></p>
        </footer>
      </article>
    </main>
  );
}
