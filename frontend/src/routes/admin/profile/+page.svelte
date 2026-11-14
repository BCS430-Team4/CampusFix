
<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.ts';

  // Placeholder administrator information.
  // Replace with authenticated user data later.
  const admin = {
    name: 'Campus Administrator',
    email: 'Not configured',
    role: 'Administrator',
    initials: 'AD'
  };

  let tickets = $state([]);
  let loading = $state(true);
  let error = $state('');

  // Administrator statistics
  let totalTickets = $derived(tickets.length);

  let activeTickets = $derived(
    tickets.filter(ticket =>
      ['Open', 'Assigned', 'In progress']
        .includes(ticket.status)
    ).length
  );

  let resolvedTickets = $derived(
    tickets.filter(ticket =>
      ['Resolved', 'Closed']
        .includes(ticket.status)
    ).length
  );

  let unassignedTickets = $derived(
    tickets.filter(ticket =>
      ['Open', 'Assigned', 'In progress']
        .includes(ticket.status) &&
      !ticket.technician
    ).length
  );

  onMount(async () => {
    try {
      const result = await CampusFixAPI.getTickets();

      if (!Array.isArray(result)) {
        throw new Error('Invalid ticket data');
      }

      tickets = result;
    } catch (err) {
      console.error('Unable to load tickets:', err);
      error = 'Unable to load account statistics.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Administrator Profile | CampusFix</title>
</svelte:head>

<main class="content">

  <!-- Page Heading -->
  <div class="page-heading">
    <h1 class="headline">Administrator Profile</h1>

    <p class="secondary-text">
      View your account information and campus maintenance overview.
    </p>
  </div>

  <!-- Profile Information -->
  <section class="profile-card">

    <div class="profile-header">
      <div class="profile-avatar">
        {admin.initials}
      </div>

      <div class="profile-info">
        <h2 class="headline">{admin.name}</h2>

        <p class="secondary-text">{admin.email}</p>

        <span class="role-badge">
          {admin.role}
        </span>
      </div>
    </div>

  </section>

  <!-- Administrator Statistics -->
  <section class="statistics-section">

    <h2 class="section-title">
      Campus maintenance overview
    </h2>

    {#if loading}
      <div class="empty-state" role="status">
        Loading statistics...
      </div>

    {:else if error}
      <div class="notice-box" role="alert">
        {error}
      </div>

    {:else}
      <div class="stat-grid admin-stats">

        <div class="stat-card">
          <div class="stat-num">{totalTickets}</div>
          <div class="stat-label">Total tickets</div>
        </div>

        <div class="stat-card">
          <div class="stat-num">{activeTickets}</div>
          <div class="stat-label">Active tickets</div>
        </div>

        <div class="stat-card">
          <div class="stat-num">{resolvedTickets}</div>
          <div class="stat-label">Resolved / closed</div>
        </div>

        <div class="stat-card">
          <div class="stat-num">{unassignedTickets}</div>
          <div class="stat-label">Unassigned</div>
        </div>

      </div>
    {/if}

  </section>

  <!-- Account Details -->
  <section class="account-section">

    <h2 class="section-title">Account details</h2>

    <div class="account-details">

      <div class="profile-row">
        <span class="secondary-text">Full name</span>
        <span>{admin.name}</span>
      </div>

      <div class="profile-row">
        <span class="secondary-text">Email</span>
        <span>{admin.email}</span>
      </div>

      <div class="profile-row">
        <span class="secondary-text">Role</span>
        <span>{admin.role}</span>
      </div>

      <div class="profile-row">
        <span class="secondary-text">Account status</span>
        <span class="secondary-text">
          Authentication not connected
        </span>
      </div>

    </div>
  </section>

  <!-- Account Actions -->
  <section class="account-actions">

    <h2 class="section-title">Account management</h2>

    <p class="secondary-text account-note">
      Profile editing and sign-out will be available
      after authentication is integrated.
    </p>

    <button
      class="btn-secondary"
      type="button"
      disabled
    >
      Edit Profile
    </button>

    <button
      class="btn-text-danger"
      type="button"
      disabled
    >
      Log Out
    </button>

  </section>

</main>

<style>
  .page-heading {
    margin-bottom: 24px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
  }

  .page-heading p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.5;
  }

  /* Profile Card */

  .profile-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 28px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--green-tint-bg);
    color: var(--green-tint-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .profile-info h2 {
    margin: 0;
    font-size: 22px;
  }

  .profile-info p {
    margin: 5px 0 10px;
    font-size: 13px;
  }

  .role-badge {
    display: inline-block;
    background: var(--green-tint-bg);
    color: var(--green-tint-text);
    border-radius: 999px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 600;
  }

  /* Statistics */

  .statistics-section {
    margin-bottom: 28px;
  }

  .statistics-section h2 {
    font-size: 19px;
    margin-bottom: 14px;
  }

  .admin-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .admin-stats .stat-card {
    background: var(--bg-alt);
    padding: 16px 10px;
  }

  .admin-stats .stat-label {
    color: var(--secondary);
  }

  /* Account Details */

  .account-section {
    margin-bottom: 28px;
  }

  .account-section h2,
  .account-actions h2 {
    font-size: 19px;
    margin-bottom: 14px;
  }

  .account-details {
    border-top: 1px solid var(--border);
  }

  .profile-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 2px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }

  .profile-row span:last-child {
    text-align: right;
  }

  /* Account Actions */

  .account-actions {
    max-width: 400px;
  }

  .account-note {
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .account-actions button {
    width: 100%;
    margin-bottom: 10px;
  }

  .account-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive */

  @media (max-width: 600px) {
    .admin-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .profile-header {
      align-items: flex-start;
    }

    .profile-row {
      flex-wrap: wrap;
    }
  }
</style>
