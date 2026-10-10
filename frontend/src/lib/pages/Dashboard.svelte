<script>
  import { CampusFixAPI } from '../api.js';
  import { greeting } from '../shared.js';
  import TicketRow from '../components/TicketRow.svelte';
  const tickets = CampusFixAPI.getTickets();
  const active = tickets.filter(t => ['Open', 'Assigned', 'In progress'].includes(t.status));
  const resolved = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).slice(0, 2);
</script>

<div style="margin-bottom:18px;">
  <div class="headline" style="font-size:22px;">{greeting()}</div>
  <div class="muted" style="font-size:13px;margin-top:2px;">You have {active.length} active report{active.length === 1 ? '' : 's'}</div>
</div>
<a class="card-cta" href="/report">
  <div class="cta-icon">+</div>
  <div><div style="font-size:15px;font-weight:600;">Report an issue</div><div class="muted" style="font-size:13px;">Takes about a minute</div></div>
</a>
<h2 class="section-title">Active tickets</h2>
{#each active.slice(0, 3) as ticket (ticket.id)}<TicketRow {ticket} />
{:else}<div class="empty-state">No active tickets right now.</div>{/each}
<h2 class="section-title" style="margin-top:18px;">Recently resolved</h2>
{#each resolved as ticket (ticket.id)}
  <a class="resolved-row" href={'/tickets/' + encodeURIComponent(ticket.id)}>
    <span><span class="ticket-id">{ticket.id}</span> &nbsp; {ticket.title}</span>
    <span class="muted">{ticket.status} · {ticket.updated}</span>
  </a>
{:else}<div class="empty-state">Nothing resolved yet.</div>{/each}

