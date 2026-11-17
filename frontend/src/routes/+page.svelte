<svelte:head>
  <title>CampusFix | Campus maintenance, made easier</title>
  <meta
    name="description"
    content="Report campus maintenance issues and keep track of their progress with CampusFix."
  />
</svelte:head>

<main class="landing-page">
  <header class="landing-header">
    <a class="brand" href="/" aria-label="CampusFix home">
      <span class="brand-mark" aria-hidden="true">C</span>
      <span>CampusFix</span>
    </a>

    <nav class="header-nav" aria-label="Main navigation">
      <a href="#how-it-works">How it works</a>
      <a href="#features">Features</a>
    </nav>

    <div class="header-actions">
      <a class="login-link" href="/login">Log in</a>
      <a class="button button-small" href="/signup">Create account</a>
    </div>
  </header>

  <section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">
        <span class="eyebrow-dot"></span>
        Farmingdale State College
      </span>

      <h1>Campus issues,<br />moving toward <span>fixed.</span></h1>

      <p class="hero-description">
        CampusFix brings maintenance requests and updates together, so campus
        problems are easier to report and follow.
      </p>

      <div class="hero-actions">
        <a class="button" href="/signup">Get started <span aria-hidden="true">→</span></a>
        <a class="text-link" href="#how-it-works">See how it works</a>
      </div>

      <div class="hero-note">
        <span class="note-icon" aria-hidden="true">✓</span>
        A clearer way to report and follow campus repairs
      </div>
    </div>

    <div class="hero-visual" aria-label="CampusFix ticket overview illustration">
      <div class="visual-orbit orbit-one"></div>
      <div class="visual-orbit orbit-two"></div>

      <div class="visual-label">
        <span class="live-dot"></span>
        CAMPUS SERVICE OVERVIEW
      </div>

      <div class="visual-card main-card">
        <div class="card-topline">
          <span class="card-icon" aria-hidden="true">✳</span>
          <span class="card-kicker">MAINTENANCE REQUEST</span>
          <span class="status-pill">In progress</span>
        </div>
        <h2>Leaking sink</h2>
        <p class="card-location">Roosevelt Hall <span>·</span> Room 3B</p>
        <div class="progress-track"><span></span></div>
        <div class="progress-caption">
          <span>Request submitted</span>
          <strong>Technician assigned</strong>
        </div>
      </div>

      <div class="floating-card map-card">
        <span class="map-pin" aria-hidden="true">●</span>
        <div>
          <strong>Campus map</strong>
          <small>Find issues by building</small>
        </div>
        <span class="map-arrow" aria-hidden="true">↗</span>
      </div>

      <div class="floating-card resolved-card">
        <span class="resolved-check" aria-hidden="true">✓</span>
        <div>
          <strong>Request resolved</strong>
          <small>One less thing to worry about</small>
        </div>
      </div>

      <div class="visual-spark spark-one" aria-hidden="true">✦</div>
      <div class="visual-spark spark-two" aria-hidden="true">✧</div>
    </div>

    <div class="hero-bottom">
      <span>REPORT</span>
      <span class="bottom-line"></span>
      <span>FOLLOW</span>
      <span class="bottom-line"></span>
      <span>RESOLVE</span>
    </div>
  </section>

  <section class="features-section" id="features">
    <div class="section-intro">
      <span class="eyebrow">ONE PLACE FOR CAMPUS FIXES</span>
      <h2>Make the next step easier.</h2>
      <p>
        From reporting an issue to seeing its progress, CampusFix helps keep
        campus maintenance organized.
      </p>
    </div>

    <div class="feature-grid">
      <article class="feature-card feature-report">
        <span class="feature-number">01</span>
        <span class="feature-icon" aria-hidden="true">＋</span>
        <h3>Report an issue</h3>
        <p>Share what needs attention and where it’s happening on campus.</p>
      </article>

      <article class="feature-card feature-track">
        <span class="feature-number">02</span>
        <span class="feature-icon" aria-hidden="true">↗</span>
        <h3>Follow progress</h3>
        <p>Check a request’s status as maintenance work moves forward.</p>
      </article>

      <article class="feature-card feature-map">
        <span class="feature-number">03</span>
        <span class="feature-icon" aria-hidden="true">⌖</span>
        <h3>Explore the map</h3>
        <p>See active maintenance tickets grouped by campus building.</p>
      </article>
    </div>
  </section>

  <section class="steps-section" id="how-it-works">
    <div class="steps-heading">
      <span class="eyebrow">SIMPLE BY DESIGN</span>
      <h2>From issue to update.</h2>
      <p>CampusFix keeps the process clear at each step.</p>
    </div>

    <div class="steps-list">
      <article class="step">
        <span class="step-index">1</span>
        <div>
          <h3>Submit a request</h3>
          <p>Describe the issue and tell us where it is.</p>
        </div>
      </article>

      <article class="step">
        <span class="step-index">2</span>
        <div>
          <h3>Maintenance reviews it</h3>
          <p>The request can be organized and assigned for follow-up.</p>
        </div>
      </article>

      <article class="step">
        <span class="step-index">3</span>
        <div>
          <h3>Keep up with progress</h3>
          <p>Check updates until the repair is complete.</p>
        </div>
      </article>
    </div>
  </section>

  <section class="cta-section">
    <div>
      <span class="eyebrow">READY WHEN YOU ARE</span>
      <h2>Help keep campus running smoothly.</h2>
      <p>Sign in or create an account to continue to CampusFix.</p>
    </div>
    <div class="cta-actions">
      <a class="button button-light" href="/signup">Create account <span aria-hidden="true">→</span></a>
      <a class="cta-login" href="/login">I already have an account</a>
    </div>
    <span class="cta-decoration" aria-hidden="true">C</span>
  </section>

  <footer class="landing-footer">
    <a class="footer-brand" href="/">CampusFix</a>
    <span>Campus maintenance, made easier.</span>
    <a href="/request-access">Staff access</a>
  </footer>
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    margin: 0;
    background: #f4f7f2;
  }

  .landing-page {
    --deep: #073f39;
    --green: #08796b;
    --mint: #c9f3e4;
    --lime: #d9f274;
    --ink: #152724;
    --muted: #66756f;
    --line: #dce6df;
    color: var(--ink);
    font-family: inherit;
  }

  .landing-header {
    width: min(1160px, calc(100% - 64px));
    min-height: 82px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .brand,
  .footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--deep);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.7px;
    text-decoration: none;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 12px 12px 12px 4px;
    background: var(--deep);
    color: white;
    font-size: 18px;
  }

  .header-nav,
  .header-actions {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .header-nav a,
  .login-link {
    color: #42534e;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }

  .header-nav a:hover,
  .login-link:hover,
  .text-link:hover,
  .landing-footer a:hover {
    color: var(--green);
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 20px;
    border: 1px solid var(--deep);
    border-radius: 9px;
    background: var(--deep);
    color: white;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
  }

  .button:hover {
    transform: translateY(-2px);
    background: var(--green);
    box-shadow: 0 10px 24px #073f3928;
  }

  .button-small {
    min-height: 40px;
    padding: 0 15px;
    font-size: 12px;
  }

  .hero {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 36px;
    width: min(1160px, calc(100% - 64px));
    min-height: 540px;
    margin: 0 auto;
    padding: 58px 5.2% 72px;
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 78% 12%, #1b776b 0, transparent 40%),
      linear-gradient(120deg, #073f39, #0a5047 60%, #0e6659);
    color: white;
  }

  .hero::before {
    position: absolute;
    top: -190px;
    right: 25%;
    width: 380px;
    height: 380px;
    border: 1px solid #ffffff18;
    border-radius: 50%;
    content: "";
  }

  .hero-copy {
    position: relative;
    z-index: 1;
    max-width: 500px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--green);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  .hero .eyebrow {
    color: #b7ecd8;
  }

  .eyebrow-dot,
  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lime);
    box-shadow: 0 0 0 4px #d9f27424;
  }

  .hero h1 {
    margin: 25px 0 18px;
    font-size: clamp(42px, 5vw, 66px);
    line-height: 1.04;
    letter-spacing: -2.7px;
  }

  .hero h1 span {
    color: var(--lime);
  }

  .hero-description {
    max-width: 430px;
    margin: 0;
    color: #d0e1db;
    font-size: 16px;
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 30px;
  }

  .hero-actions .button {
    border-color: var(--lime);
    background: var(--lime);
    color: var(--deep);
  }

  .hero-actions .button:hover {
    background: #e5ff9b;
  }

  .text-link {
    color: white;
    font-size: 13px;
    font-weight: 700;
    text-underline-offset: 4px;
  }

  .hero-note {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 34px;
    color: #bdd4cc;
    font-size: 11px;
  }

  .note-icon {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff1a;
    color: var(--lime);
    font-weight: 800;
  }

  .hero-visual {
    position: relative;
    min-height: 360px;
    display: grid;
    place-items: center;
  }

  .visual-orbit {
    position: absolute;
    border: 1px solid #ffffff1b;
    border-radius: 50%;
  }

  .orbit-one {
    width: 390px;
    height: 390px;
  }

  .orbit-two {
    width: 300px;
    height: 300px;
    border-style: dashed;
  }

  .visual-label {
    position: absolute;
    top: 16px;
    left: 8%;
    display: flex;
    align-items: center;
    gap: 9px;
    color: #c7e4db;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.3px;
  }

  .live-dot {
    width: 6px;
    height: 6px;
  }

  .visual-card {
    position: relative;
    z-index: 1;
    width: min(100%, 360px);
    padding: 24px;
    border: 1px solid #ffffff;
    border-radius: 16px;
    background: #fbfdf9;
    color: var(--ink);
    box-shadow: 0 24px 70px #001c1945;
    transform: rotate(-2deg);
  }

  .card-topline {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 9px;
    background: #e0f5eb;
    color: var(--green);
    font-size: 18px;
  }

  .card-kicker {
    color: #74827c;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .status-pill {
    margin-left: auto;
    padding: 6px 8px;
    border-radius: 20px;
    background: #e4f5dc;
    color: #36783e;
    font-size: 9px;
    font-weight: 700;
  }

  .main-card h2 {
    margin: 22px 0 5px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .card-location {
    margin: 0;
    color: var(--muted);
    font-size: 12px;
  }

  .card-location span {
    padding: 0 4px;
    color: #9aa8a1;
  }

  .progress-track {
    height: 7px;
    margin-top: 28px;
    overflow: hidden;
    border-radius: 9px;
    background: #e8eee9;
  }

  .progress-track span {
    display: block;
    width: 68%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0b806c, #a6d85d);
  }

  .progress-caption {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 9px;
    color: #819088;
    font-size: 8px;
  }

  .progress-caption strong {
    color: var(--green);
  }

  .floating-card {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #ffffffa8;
    border-radius: 12px;
    background: white;
    color: var(--ink);
    box-shadow: 0 14px 30px #001c1933;
  }

  .floating-card strong,
  .floating-card small {
    display: block;
  }

  .floating-card strong {
    font-size: 10px;
  }

  .floating-card small {
    margin-top: 3px;
    color: var(--muted);
    font-size: 8px;
  }

  .map-card {
    top: 68px;
    right: 0;
    transform: rotate(3deg);
  }

  .map-pin {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 9px;
    background: #e6f5ed;
    color: var(--green);
    font-size: 16px;
  }

  .map-arrow {
    margin-left: 8px;
    color: var(--green);
    font-size: 15px;
  }

  .resolved-card {
    bottom: 38px;
    left: 0;
    transform: rotate(-3deg);
  }

  .resolved-check {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--lime);
    color: var(--deep);
    font-size: 15px;
    font-weight: 900;
  }

  .visual-spark {
    position: absolute;
    color: var(--lime);
  }

  .spark-one {
    top: 95px;
    left: 17%;
    font-size: 23px;
  }

  .spark-two {
    right: 11%;
    bottom: 75px;
    font-size: 28px;
  }

  .hero-bottom {
    position: absolute;
    right: 5.2%;
    bottom: 24px;
    left: 5.2%;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #b8d5cb;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  .bottom-line {
    width: 42px;
    height: 1px;
    background: #ffffff45;
  }

  .features-section,
  .steps-section {
    width: min(1060px, calc(100% - 64px));
    margin: 0 auto;
    padding: 100px 0;
  }

  .section-intro {
    max-width: 570px;
    margin-bottom: 36px;
  }

  .section-intro h2,
  .steps-heading h2 {
    margin: 13px 0 10px;
    color: var(--deep);
    font-size: clamp(30px, 4vw, 42px);
    letter-spacing: -1.5px;
  }

  .section-intro p,
  .steps-heading > p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.7;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .feature-card {
    position: relative;
    min-height: 195px;
    padding: 24px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: white;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 34px #143e2b10;
  }

  .feature-number {
    position: absolute;
    top: 23px;
    right: 23px;
    color: #9aa9a1;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .feature-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 13px;
    font-size: 25px;
    font-weight: 500;
  }

  .feature-report .feature-icon {
    background: #dcf6e9;
    color: #08715c;
  }

  .feature-track .feature-icon {
    background: #f2f4cc;
    color: #777d1b;
  }

  .feature-map .feature-icon {
    background: #e0effa;
    color: #28729a;
  }

  .feature-card h3 {
    margin: 23px 0 7px;
    color: var(--deep);
    font-size: 17px;
  }

  .feature-card p {
    max-width: 260px;
    margin: 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .steps-section {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 60px;
    padding-top: 22px;
  }

  .steps-heading h2 {
    margin-bottom: 12px;
  }

  .steps-list {
    border-top: 1px solid var(--line);
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 17px;
    padding: 20px 0;
    border-bottom: 1px solid var(--line);
  }

  .step-index {
    display: grid;
    flex: 0 0 30px;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--deep);
    color: white;
    font-size: 12px;
    font-weight: 800;
  }

  .step h3 {
    margin: 1px 0 5px;
    color: var(--deep);
    font-size: 14px;
  }

  .step p {
    margin: 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .cta-section {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    width: min(1160px, calc(100% - 64px));
    margin: 0 auto 42px;
    padding: 42px 5%;
    overflow: hidden;
    border-radius: 18px;
    background: #dff4e9;
  }

  .cta-section .eyebrow {
    color: var(--green);
  }

  .cta-section h2 {
    position: relative;
    z-index: 1;
    margin: 11px 0 7px;
    color: var(--deep);
    font-size: clamp(24px, 3vw, 34px);
    letter-spacing: -1px;
  }

  .cta-section p {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #536d63;
    font-size: 13px;
  }

  .cta-actions {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 190px;
  }

  .button-light {
    width: 100%;
    border-color: var(--deep);
    background: var(--deep);
  }

  .cta-login {
    color: var(--deep);
    font-size: 11px;
    font-weight: 700;
    text-underline-offset: 3px;
  }

  .cta-decoration {
    position: absolute;
    right: 21%;
    bottom: -96px;
    color: #ffffff75;
    font-size: 250px;
    font-weight: 900;
    line-height: 1;
  }

  .landing-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: min(1160px, calc(100% - 64px));
    margin: 0 auto;
    padding: 0 0 28px;
    color: var(--muted);
    font-size: 11px;
  }

  .footer-brand {
    font-size: 15px;
  }

  .landing-footer a:last-child {
    color: var(--green);
    font-weight: 700;
    text-decoration: none;
  }

  @media (max-width: 760px) {
    .landing-header,
    .hero,
    .features-section,
    .steps-section,
    .cta-section,
    .landing-footer {
      width: min(100% - 36px, 600px);
    }

    .landing-header {
      min-height: 72px;
    }

    .header-nav {
      display: none;
    }

    .hero {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 48px 7% 72px;
    }

    .hero-copy {
      max-width: 560px;
    }

    .hero-visual {
      min-height: 330px;
    }

    .features-section {
      padding: 74px 0;
    }

    .steps-section {
      grid-template-columns: 1fr;
      gap: 28px;
      padding-top: 0;
    }

    .cta-section {
      align-items: flex-start;
      flex-direction: column;
      padding: 34px 7%;
    }

    .cta-actions {
      align-items: flex-start;
    }

    .button-light {
      width: auto;
    }

    .cta-decoration {
      right: -4%;
      bottom: -85px;
    }
  }

  @media (max-width: 520px) {
    .landing-header,
    .hero,
    .features-section,
    .steps-section,
    .cta-section,
    .landing-footer {
      width: calc(100% - 28px);
    }

    .brand {
      font-size: 17px;
    }

    .header-actions {
      gap: 13px;
    }

    .login-link {
      font-size: 12px;
    }

    .button-small {
      min-height: 36px;
      padding: 0 11px;
      font-size: 10px;
    }

    .hero {
      min-height: unset;
      padding: 40px 22px 66px;
      border-radius: 16px;
    }

    .hero h1 {
      font-size: 43px;
      letter-spacing: -1.8px;
    }

    .hero-description {
      font-size: 14px;
    }

    .hero-actions {
      align-items: flex-start;
      flex-direction: column;
      gap: 17px;
    }

    .hero-visual {
      min-height: 300px;
      margin: 0 -8px;
    }

    .orbit-one {
      width: 300px;
      height: 300px;
    }

    .orbit-two {
      width: 230px;
      height: 230px;
    }

    .visual-card {
      padding: 18px;
    }

    .map-card {
      top: 28px;
      right: -3px;
    }

    .resolved-card {
      bottom: 18px;
      left: -3px;
    }

    .visual-label {
      top: 0;
      left: 2%;
    }

    .feature-grid {
      grid-template-columns: 1fr;
    }

    .feature-card {
      min-height: 170px;
    }

    .features-section {
      padding: 64px 0;
    }

    .landing-footer {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .landing-footer span {
      order: 3;
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
    }
  }
</style>