<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Ticket } from '$lib/api';
  import { STATUS_COLOR } from '../shared.js';
  let { ticket }: { ticket: Ticket } = $props();
  let color = $derived((STATUS_COLOR[ticket.status as keyof typeof STATUS_COLOR] || STATUS_COLOR.Open)[0]);
</script>

<a class="ticket-row" style:border-left={'4px solid ' + color} href={resolve('/tickets/[id]', { id: ticket.id })}>
  <div class="top">
    <span><span class="ticket-id">{ticket.id}</span> <span class="ticket-title">{ticket.title}</span></span>
    <span class="status-tag" style:color>{ticket.status}</span>
  </div>
  <div class="ticket-meta">{ticket.building} · {ticket.room}</div>
</a>

