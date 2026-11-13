<script lang="ts">
  let message = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    message =
      'Your request form is ready. It will be sent when the staff access service is connected.';
  }
</script>

<svelte:head>
  <title>Request Staff Access | CampusFix</title>
</svelte:head>

<main class="app auth-page">
  <section class="auth-card" aria-labelledby="request-title">
    <a class="brand auth-brand" href="/">CampusFix</a>

    <h1 id="request-title" class="headline">Request staff access</h1>
    <p class="secondary-text">
      Submit this form to request a Technician or Admin account.
    </p>

    {#if message}
      <div class="notice-box auth-message" role="status">{message}</div>
    {/if}

    <form onsubmit={handleSubmit}>
      <div class="field-block">
        <label class="field-label" for="name">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autocomplete="name"
          required
        />
      </div>

      <div class="field-block">
        <label class="field-label" for="email">College email</label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
        />
      </div>

      <div class="field-block">
        <label class="field-label" for="requested-role">Access requested</label>
        <select id="requested-role" name="requested-role" required>
          <option value="" disabled selected>Select a role</option>
          <option value="Technician">Technician</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div class="field-block">
        <label class="field-label" for="reason">Why do you need access?</label>
        <textarea
          id="reason"
          name="reason"
          rows="4"
          required
        ></textarea>
      </div>

      <button class="btn-primary" type="submit">Send request</button>
    </form>

    <p class="auth-switch">
      <a href="/signup">Back to signup</a>
      ·
      <a href="/login">Log in</a>
    </p>
  </section>
</main>

<style>
  .auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--bg-alt);
  }

  .auth-card {
    width: min(100%, 420px);
    padding: 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
  }

  .auth-brand {
    color: var(--green);
    margin-bottom: 18px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
  }

  .auth-card > p {
    margin: 6px 0 22px;
    font-size: 14px;
  }

  .auth-message {
    display: block;
    margin-bottom: 16px;
  }

  .auth-switch {
    margin: 20px 0 0;
    text-align: center;
    font-size: 13px;
  }

  .auth-switch a {
    color: var(--green-accent);
    font-weight: 600;
  }
</style>