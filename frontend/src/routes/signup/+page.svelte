<script lang="ts">
  let password = $state('');
  let confirmPassword = $state('');
  let message = $state('');
  let messageIsError = $state(false);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (password !== confirmPassword) {
      message = 'The passwords do not match.';
      messageIsError = true;
      return;
    }

    message =
      'Account creation will be available when CampusFix authentication is connected.';
    messageIsError = false;
  }
</script>

<svelte:head>
  <title>Create an account | CampusFix</title>
</svelte:head>

<main class="app auth-page">
  <section class="auth-card" aria-labelledby="signup-title">
    <div class="welcome-panel">
      <a class="brand auth-brand" href="/">CampusFix</a>

      <div class="welcome-copy">
        <p class="welcome-label">WELCOME TO CAMPUSFIX</p>
        <h2>A better way to care for your campus.</h2>
        <p class="welcome-description">
          Create an account to report maintenance issues and keep track of
          updates in one place.
        </p>
      </div>

      <div class="welcome-features" aria-label="CampusFix features">
        <div class="feature">
          <span class="feature-number">01</span>
          <span>Submit a campus maintenance request</span>
        </div>
        <div class="feature">
          <span class="feature-number">02</span>
          <span>Follow the status of your tickets</span>
        </div>
        <div class="feature">
          <span class="feature-number">03</span>
          <span>Stay informed as work progresses</span>
        </div>
      </div>

      <p class="welcome-footer">CampusFix <span>·</span> Facilities support</p>
    </div>

    <div class="form-panel">
      <div class="form-heading">
        <p class="form-eyebrow">GET STARTED</p>
        <h1 id="signup-title">Create your account</h1>
        <p class="secondary-text">Sign up to use CampusFix.</p>
      </div>

      {#if message}
        <div
          class="notice-box auth-message"
          class:error={messageIsError}
          role={messageIsError ? 'alert' : 'status'}
        >
          {message}
        </div>
      {/if}

      <form onsubmit={handleSubmit}>
        <div class="form-grid">
          <div class="field-block">
            <label class="field-label" for="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autocomplete="name"
              placeholder="Your full name"
              required
            />
          </div>

          <div class="field-block">
            <label class="field-label" for="role">I am a</label>
            <select id="role" name="role" required>
              <option value="" disabled selected>Select your role</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>

          <div class="field-block full-width">
            <label class="field-label" for="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.edu"
              required
            />
          </div>

          <div class="field-block full-width">
            <label class="field-label" for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              bind:value={password}
              minlength="8"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div class="field-block full-width">
            <label class="field-label" for="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              bind:value={confirmPassword}
              minlength="8"
              placeholder="Enter it again"
              required
            />
          </div>
        </div>

        <button class="btn-primary signup-button" type="submit">
          Create account
        </button>
      </form>

      <div class="auth-links">
        <p>
          Already have an account?
          <a href="/login">Log in</a>
        </p>

        <p>
          Staff member?
          <a href="/request-access">Request staff access</a>
        </p>
      </div>
    </div>
  </section>
</main>

<style>
  .auth-page {
    box-sizing: border-box;
    width: 100vw;
    max-width: none;
    min-height: 100vh;
    margin-left: calc(50% - 50vw);
    padding: 40px 24px;
    display: grid;
    place-items: center;
    background:
      radial-gradient(ellipse at 12% 14%, rgba(22, 138, 120, 0.12), transparent 32%),
      radial-gradient(ellipse at 88% 86%, rgba(233, 180, 76, 0.12), transparent 28%),
      #eef5f1;
  }

  .auth-card {
    width: min(100%, 1040px);
    min-height: 650px;
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    overflow: hidden;
    border: 1px solid rgba(0, 76, 69, 0.12);
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 24px 70px rgba(22, 57, 48, 0.14);
  }

  .welcome-panel {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 44px;
    color: #fff;
    background: linear-gradient(145deg, #004c45 0%, #08695e 58%, #168a78 100%);
  }

  .welcome-panel::before,
  .welcome-panel::after {
    position: absolute;
    z-index: -1;
    content: '';
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
  }

  .welcome-panel::before {
    width: 330px;
    height: 330px;
    top: 115px;
    right: -190px;
    box-shadow:
      0 0 0 26px rgba(255, 255, 255, 0.035),
      0 0 0 52px rgba(255, 255, 255, 0.025);
  }

  .welcome-panel::after {
    width: 160px;
    height: 160px;
    left: -110px;
    bottom: 35px;
    background: rgba(233, 180, 76, 0.12);
  }

  .auth-brand {
    width: fit-content;
    color: #fff;
    font-size: 30px;
    font-weight: 700;
    text-decoration: none;
  }

  .welcome-copy {
    max-width: 360px;
    margin: auto 0;
    padding: 44px 0;
  }

  .welcome-label,
  .form-eyebrow {
    margin: 0 0 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  .welcome-label {
    color: #bce8d9;
  }

  .welcome-copy h2 {
    max-width: 340px;
    margin: 0;
    font-size: clamp(32px, 4vw, 43px);
    line-height: 1.12;
    letter-spacing: -0.03em;
  }

  .welcome-description {
    max-width: 330px;
    margin: 18px 0 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 15px;
    line-height: 1.7;
  }

  .welcome-features {
    display: grid;
    gap: 13px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 13px;
  }

  .feature-number {
    display: grid;
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 50%;
    color: #f5d98e;
    font-size: 10px;
    font-weight: 700;
  }

  .welcome-footer {
    margin: 28px 0 0;
    color: rgba(255, 255, 255, 0.67);
    font-size: 11px;
  }

  .welcome-footer span {
    padding: 0 5px;
    color: #f5d98e;
  }

  .form-panel {
    align-self: center;
    width: 100%;
    max-width: 570px;
    box-sizing: border-box;
    justify-self: center;
    padding: 48px;
  }

  .form-eyebrow {
    color: #168a78;
  }

  .form-heading h1 {
    margin: 0;
    color: #1c1c1a;
    font-size: 32px;
    letter-spacing: -0.03em;
  }

  .form-heading > p:last-child {
    margin: 8px 0 24px;
    font-size: 14px;
  }

  .auth-message {
    display: block;
    margin-bottom: 18px;
  }

  .auth-message.error {
    color: var(--danger);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 14px;
  }

  .field-block {
    min-width: 0;
    margin-bottom: 17px;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .field-label {
    display: block;
    margin-bottom: 8px;
    color: #292d2a;
    font-size: 13px;
    font-weight: 600;
  }

  .field-block input,
  .field-block select {
    box-sizing: border-box;
    width: 100%;
    min-height: 48px;
    padding: 11px 12px;
    border: 1px solid #d9e2dc;
    border-radius: 10px;
    background: #fbfdfb;
    color: #1c1c1a;
    font: inherit;
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }

  .field-block input::placeholder {
    color: #8a948e;
  }

  .field-block input:focus,
  .field-block select:focus {
    border-color: #168a78;
    outline: none;
    box-shadow: 0 0 0 3px rgba(22, 138, 120, 0.14);
  }

  .signup-button {
    width: 100%;
    min-height: 50px;
    margin-top: 2px;
    border: 0;
    border-radius: 10px;
    background: #004c45;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 150ms ease, transform 150ms ease;
  }

  .signup-button:hover {
    background: #08695e;
    transform: translateY(-1px);
  }

  .auth-links {
    display: grid;
    gap: 13px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #edf1ed;
  }

  .auth-links p {
    margin: 0;
    color: #626b65;
    font-size: 13px;
  }

  .auth-links a {
    color: #087466;
    font-weight: 700;
    text-underline-offset: 3px;
  }

  .auth-links a:hover {
    color: #004c45;
  }

  @media (max-width: 760px) {
    .auth-page {
      padding: 20px 14px;
    }

    .auth-card {
      max-width: 560px;
      grid-template-columns: 1fr;
    }

    .welcome-panel {
      min-height: 300px;
      padding: 30px;
    }

    .welcome-copy {
      margin: 32px 0 20px;
      padding: 0;
    }

    .welcome-copy h2 {
      max-width: 460px;
      font-size: 34px;
    }

    .welcome-footer {
      margin-top: 22px;
    }

    .form-panel {
      padding: 38px 30px 34px;
    }
  }

  @media (max-width: 480px) {
    .welcome-panel {
      padding: 26px 22px;
    }

    .form-panel {
      padding: 32px 22px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .full-width {
      grid-column: auto;
    }

    .form-heading h1 {
      font-size: 29px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
    }
  }
</style>