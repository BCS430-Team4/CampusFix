<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '../api.js';
  import { STATUS_COLOR } from '../shared.js';
  import Topbar from '../components/Topbar.svelte';
  import Icon from '../components/Icon.svelte';
  let { id, justSubmitted = false, notify } = $props();
  let ticket = $state(null);
  let editing = $state(false);
  let title = $state('');
  let description = $state('');
  let comment = $state('');
  let colors = $derived(STATUS_COLOR[ticket?.status] || STATUS_COLOR.Open);

  onMount(() => {
    ticket = CampusFixAPI.getTicket(id);
    if (justSubmitted) notify('Report submitted');
  });

  function edit() {
    title = ticket.title;
    description = ticket.description;
    editing = true;
  }

  function save(event) {
    event.preventDefault();
    if (!title.trim()) { notify("Title can't be empty"); return; }
    if (ticket.status !== 'Open') return;
    ticket = CampusFixAPI.updateTicket(id, { title: title.trim(), description: description.trim() });
    editing = false;
    notify('Changes saved');
  }

  function cancel() {
    if (ticket.status !== 'Open' || !confirm("Cancel this report? This can't be undone.")) return;
    CampusFixAPI.updateTicket(id, { status: 'Closed' });
    CampusFixAPI.addComment(id, 'Report cancelled by reporter.');
    notify('Report cancelled');
    goto('/my-tickets');
  }

  function send(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    ticket = CampusFixAPI.addComment(id, comment.trim());
    comment = '';
  }
</script>

<Topbar title={ticket?.title || 'Ticket not found'} idLabel={ticket?.id || ''} backHref="/my-tickets" />
<main class="content">
  {#if !ticket}<div class="empty-state">This ticket doesn't exist in the mock data.</div>
  {:else if editing}
    <form onsubmit={save} novalidate>
      <div class="field-block"><label class="field-label" for="edit-title">Title</label><input id="edit-title" type="text" bind:value={title} /></div>
      <div class="field-block"><label class="field-label" for="edit-description">Description</label><textarea id="edit-description" rows="3" bind:value={description}></textarea></div>
      <button class="btn-primary" style="margin-bottom:8px;" type="submit">Save changes</button>
      <button class="btn-secondary" type="button" onclick={() => editing = false}>Cancel</button>
    </form>
  {:else}
    <div style="margin-bottom:18px;">
      <span class="status-badge" style:color={colors[0]} style:background={colors[1]}>{ticket.status}</span>
      {#if ticket.priority}<span class="status-badge" style="color:var(--warning);background:var(--warning-bg);margin-left:8px;">{ticket.priority} priority</span>{/if}
    </div>
    <div class="meta-grid">
      <div><div class="k">Category</div><div class="v">{ticket.category}</div></div>
      <div><div class="k">Location</div><div class="v">{ticket.building} · {ticket.room}</div></div>
      <div><div class="k">Assigned technician</div><div class="v">{ticket.technician || 'Not yet assigned'}</div></div>
      <div><div class="k">Associated asset</div><div class="v">{ticket.asset || '—'}</div></div>
      <div><div class="k">Created</div><div class="v">{ticket.created}</div></div>
      <div><div class="k">Last updated</div><div class="v">{ticket.updated}</div></div>
    </div>
    <h2 class="section-title">Description</h2>
    <div class="secondary-text" style="font-size:13px;line-height:1.5;margin-bottom:20px;white-space:pre-wrap;">{ticket.description || 'No description provided.'}</div>
    {#if ticket.status === 'Open'}
      <button class="btn-secondary" style="margin-bottom:8px;" onclick={edit}>Edit report</button>
      <button class="btn-text-danger" style="margin-bottom:20px;" onclick={cancel}>Cancel report</button>
    {:else}
      <div class="notice-box"><Icon name="lock" size={18} /> This report is locked. Use comments for updates.</div>
    {/if}
    <h2 class="section-title">Comments</h2>
    {#each ticket.comments as item}
      <div class="comment" class:mine={item.role === 'You'}>
        <div class="who"><span class="name">{item.author}</span><span class="when">{item.role} · {item.when}</span></div>
        <div class="body" style="white-space:pre-wrap;">{item.body}</div>
      </div>
    {:else}<div class="empty-state" style="padding:12px 0;">No comments yet.</div>{/each}
    <form class="comment-input-row" style="margin-top:12px;" onsubmit={send}>
      <input type="text" aria-label="Add a comment" placeholder="Add a comment" bind:value={comment} />
      <button type="submit">Send</button>
    </form>
  {/if}
</main>


