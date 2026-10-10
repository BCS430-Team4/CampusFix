<script>
  import { CampusFixAPI } from '../api.js';
  let { notify } = $props();
  const tickets = CampusFixAPI.getTickets();
  const active = tickets.filter(t => ['Open', 'Assigned', 'In progress'].includes(t.status)).length;
  const resolved = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
</script>

<div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
  <div class="profile-avatar">AG</div>
  <div><div class="headline" style="font-size:19px;">Aneudys Garcia</div><div class="muted" style="font-size:12px;">garca18@farmingdale.edu · Student</div></div>
</div>
<div class="stat-grid">
  <div class="stat-card"><div class="stat-num">{tickets.length}</div><div class="stat-label">Tickets filed</div></div>
  <div class="stat-card"><div class="stat-num">{active}</div><div class="stat-label">Active</div></div>
  <div class="stat-card"><div class="stat-num">{resolved}</div><div class="stat-label">Resolved</div></div>
</div>
<h2 class="section-title">Account details</h2>
<div style="margin-bottom:22px;">
  {#each [['Full name', 'Aneudys Garcia'], ['Email', 'garca18@farmingdale.edu'], ['Role', 'Student'], ['Member since', 'Jan 2026']] as [label, value]}
    <div class="profile-row"><span class="secondary-text">{label}</span><span>{value}</span></div>
  {/each}
</div>
<button class="btn-secondary" style="margin-bottom:8px;" onclick={() => notify('Not wired to a backend in this preview')}>Edit profile</button>
<button class="btn-text-danger" onclick={() => notify('There is no login in this preview yet')}>Log out</button>

