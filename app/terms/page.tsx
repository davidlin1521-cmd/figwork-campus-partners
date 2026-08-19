import "./terms.css";

export default function TermsPage() {
  return (
    <main className="terms-page">
      <header className="terms-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="terms-logo" href="/" aria-label="Back to Figwork Campus Partners">
          LOGO ASSET
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="terms-back" href="/">Back to program</a>
      </header>

      <section className="terms-hero">
        <p className="terms-kicker">FIGWORK CAMPUS PARTNERS</p>
        <h1>Program terms.</h1>
        <p className="terms-deck">
          The plain-language rules for the Figwork referral program and Campus Partners program.
        </p>
      </section>

      <article className="terms-document" aria-labelledby="full-terms">
        <header className="terms-document__header">
          <p className="terms-kicker">THE TERMS</p>
          <h2 id="full-terms">The details, plainly.</h2>
          <p>
            These are the rules of the Figwork referral program and the Campus Partners program. They are written in plain language on purpose. By joining either program - using a referral link to earn, or accepting a Campus Partner position - you agree to them.
          </p>
        </header>

        <details className="term-section" id="what-the-program-is">
          <summary>
            <span className="term-number">01</span>
            <h3>What is the program?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Figwork users get a personal referral link. When someone you refer becomes a verified activation, you earn a cash reward. Campus Partners are a small selected group who earn from the same link with a higher semester limit and can propose campus events for Figwork to fund.</li>
              <li>This is not a job. Joining does not create an employment, contractor, or agency relationship with Figwork. There are no hours, duties, quotas, or required tasks, and nobody at Figwork will direct your activity.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="who-can-participate">
          <summary>
            <span className="term-number">02</span>
            <h3>Who can participate?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>You must be 18 or older.</li>
              <li>You must not be in the United States on a student visa, for example F-1 or J-1. <span className="terms-placeholder">COUNSEL: confirm exact visa categories and phrasing.</span></li>
              <li>You must have a valid U.S. taxpayer identification number and be able to complete a Form W-9 when asked.</li>
              <li>If you are a college athlete, you are responsible for any reporting your school or athletic association requires for deals and benefits.</li>
              <li>Figwork employees and their immediate family cannot earn referral rewards.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="verified-activation">
          <summary>
            <span className="term-number">03</span>
            <h3>What counts as a verified activation?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>A reward is earned when a person you referred, within 14 days of using your link, installs the Figwork Chrome extension, creates an account, uploads their resume, <span className="terms-placeholder">completes one qualifying product action - final definition pending counsel and product approval</span>, and is verified as a real, unique person.</li>
              <li>Installs alone never earn a reward. One reward per referred person, ever - duplicate, shared, or fabricated accounts earn nothing.</li>
              <li>Referring means sharing your link yourself. Rewards are only paid for people you directly referred - never for people they refer, and never for recruiting other referrers.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="payment">
          <summary>
            <span className="term-number">04</span>
            <h3>How and when are rewards paid?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>The reward is <span className="terms-placeholder">$[RATE]</span> per verified activation, with a limit of <span className="terms-placeholder">[CAP]</span> verified activations per person per semester. Campus Partners have a limit of <span className="terms-placeholder">[PARTNER CAP]</span>.</li>
              <li>Each reward is held for about 10 days while we verify the activation, then paid out to you. You do not need to invoice or request payment.</li>
              <li>If we find that a paid reward came from fraud or a fake account, we will deduct that amount from your future rewards, and we may remove you from the program.</li>
              <li>Rewards are cash only. We do not pay in gift cards, and the welcome kit is a gift, not payment.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="taxes">
          <summary>
            <span className="term-number">05</span>
            <h3>What should I know about taxes?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>Reward payments are taxable income to you, whatever the amount. You are responsible for declaring and paying income tax on them.</li>
              <li>If your rewards reach $2,000 in a calendar year, Figwork will issue you a Form 1099-NEC. Below that amount you will not receive a form, but the income is still taxable to you.</li>
            </ul>
          </div>
        </details>

        <details className="term-section" id="posting">
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

        <details className="term-section" id="sharing">
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

        <details className="term-section" id="changes">
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

        <details className="term-section" id="campus-partners">
          <summary>
            <span className="term-number">09</span>
            <h3>What does being a Campus Partner mean?</h3>
            <span className="term-toggle" aria-hidden="true">+</span>
          </summary>
          <div className="term-section__body">
            <ul>
              <li>The Campus Partner title is a program designation, not a position or title of employment at Figwork.</li>
              <li>Event proposals are voluntary. If Figwork approves a proposal, Figwork pays the vendor directly - Partners never receive or handle event money.</li>
              <li>The welcome kit is a one-time gift.</li>
            </ul>
          </div>
        </details>

        <footer className="terms-document__footer">
          <p>Questions about these terms: <span className="terms-placeholder">[CONTACT EMAIL]</span></p>
          <p>Effective date: <span className="terms-placeholder">[DATE]</span></p>
          <strong>DRAFT - not effective until reviewed by counsel and published.</strong>
        </footer>
      </article>
    </main>
  );
}
