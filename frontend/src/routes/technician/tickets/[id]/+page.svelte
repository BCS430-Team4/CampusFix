<script>
  import { getContext, onMount } from 'svelte';
  import { page } from '$app/state';
  import { CampusFixAPI } from '$lib/api.js';
  import { STATUS_COLOR } from '$lib/shared.js';

  const technicianName = 'J. Delgado';
  const notify = getContext('notify');

  let ticket = $state(null);
  let loading = $state(true);
  let error = $state('');
  let actionError = $state('');

  let status = $state('Assigned');
  let priority = $state('');
  let comment = $state('');
  let completionNotes = $state('');
  let resolving = $state(false);

  let finished = $derived(
    ticket?.status === 'Resolved' || ticket?.status === 'Closed'
  );

  let colors = $derived(
    STATUS_COLOR[ticket?.status] || STATUS_COLOR.Open
  );

  onMount(() => {
    try {
      const found = CampusFixAPI.getTicket(page.params.id);

      if (!found || found.technician !== technicianName) {
        error = 'This ticket was not found or is not assigned to you.';
      } else {
        ticket = found;
        status = found.status;
        priority = found.priority || '';
      }
    } catch {
      error = 'Unable to load this ticket. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  function currentTicket() {
    const current = CampusFixAPI.getTicket(page.params.id);

    if (!current || current.technician !== technicianName) {
      throw new Error('Assignment changed');
    }

    return current;
  }

  function technicianComment(body) {
    return {
      author: technicianName,
      role: 'Technician',
      when: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      body
    };
  }

  function saveChanges(event) {
    event.preventDefault();
    actionError = '';

    try {
      const current = currentTicket();

      if (['Resolved', 'Closed'].includes(current.status)) {
        actionError = 'This ticket is already finished. Refresh to see its status.';
        return;
      }

      if (!['Open', 'Assigned', 'In progress'].includes(status)) {
        actionError = 'Please select a valid status.';
        return;
      }

      if (!['', 'Low', 'Medium', 'High'].includes(priority)) {
        actionError = 'Please select a valid priority.';
        return;
      }

      const updated = CampusFixAPI.updateTicket(current.id, {
        status,
        priority: priority || null
      });

      if (!updated) throw new Error('Ticket missing');

      ticket = updated;
      notify('Ticket updated successfully');
    } catch {
      actionError = 'Unable to save changes. Refresh and try again.';
    }
  }

  function postComment(event) {
    event.preventDefault();
    actionError = '';

    if (!comment.trim()) {
      actionError = 'Please enter a comment.';
      return;
    }

    try {
      const current = currentTicket();

      const updated = CampusFixAPI.updateTicket(current.id, {
        comments: [
          ...(current.comments || []),
          technicianComment(comment.trim())
        ]
      });

      if (!updated) throw new Error('Ticket missing');

      ticket = updated;
      comment = '';
      notify('Comment posted');
    } catch {
      actionError = 'Unable to post your comment. Refresh and try again.';
    }
  }

  function resolveTicket(event) {
    event.preventDefault();
    actionError = '';

    if (!completionNotes.trim()) {
      actionError = 'Describe the work completed before resolving this ticket.';
      return;
    }

    try {
      const current = currentTicket();

      if (['Resolved', 'Closed'].includes(current.status)) {
        actionError = 'This ticket is already finished. Refresh to see its status.';
        return;
      }

      const notes = completionNotes.trim();

      const updated = CampusFixAPI.updateTicket(current.id, {
        status: 'Resolved',
        completionNotes: notes,
        completedAt: new Date().toISOString(),
        comments: [
          ...(current.comments || []),
          technicianComment('Repair completed: ' + notes)
        ]
      });

      if (!updated) throw new Error('Ticket missing');

      ticket = updated;
      status = 'Resolved';
      completionNotes = '';
      resolving = false;
      notify('Ticket marked as resolved');
    } catch {
      actionError = 'Unable to resolve this ticket. Refresh and try again.';
    }
  }
</script>

<svelte:head>
  <title>{ticket?.title || 'Ticket Details'} | CampusFix</title>
</svelte:head>

<main class="content">
  <a class="back-link" href="/technician/assigned">
    ← Back to assigned tickets
  </a>

  {#if loading}
    <div class="empty-state" role="status">Loading ticket…</div>
  {:else if error}
    <div class="notice-box" role="alert">{error}</div>
  {:else if ticket}
    <div class="ticket-heading">
      <div class="ticket-id">{ticket.id}</div>
      <h1 class="headline">{ticket.title}</h1>

      <div class="badge-row">
        <span
          class="status-badge"
          style:color={colors[0]}
          style:background={colors[1]}
        >
          {ticket.status}
        </span>

        <span class="secondary-text priority-text">
          {ticket.priority
            ? `${ticket.priority} priority`
            : 'Not prioritized'}
        </span>
      </div>
    </div>

    {#if actionError}
      <div class="notice-box action-error" role="alert">
        {actionError}
      </div>
    {/if}

    <div class="details-columns">
      <section class="panel" aria-labelledby="details-title">
        <h2 id="details-title" class="section-title">Issue details</h2>

        <div class="meta-grid">
          <div>
            <div class="k">Category</div>
            <div class="v">{ticket.category}</div>
          </div>

          <div>
            <div class="k">Location</div>
            <div class="v">{ticket.building} · {ticket.room}</div>
          </div>

          <div>
            <div class="k">Assigned technician</div>
            <div class="v">{ticket.technician}</div>
          </div>

          <div>
            <div class="k">Associated asset</div>
            <div class="v">{ticket.asset || 'No asset linked'}</div>
          </div>

          <div>
            <div class="k">Reported</div>
            <div class="v">{ticket.created}</div>
          </div>

          <div>
            <div class="k">Last updated</div>
            <div class="v">{ticket.updated}</div>
          </div>
        </div>

        <h3 class="section-title">Description</h3>
        <p class="description secondary-text">
          {ticket.description || 'No description provided.'}
        </p>

        {#if ticket.completionNotes}
          <h3 class="section-title">Completion notes</h3>
          <p class="description secondary-text">
            {ticket.completionNotes}
          </p>
        {/if}
      </section>

      <section class="panel" aria-labelledby="update-title">
        <h2 id="update-title" class="section-title">Manage repair</h2>

        {#if finished}
          <div class="notice-box">
            This ticket is {ticket.status.toLowerCase()}.
            You can still add a follow-up comment below.
          </div>
        {:else}
          <form onsubmit={saveChanges}>
            <div class="field-block">
              <label class="field-label" for="repair-status">Status</label>
              <select id="repair-status" bind:value={status}>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In progress">In progress</option>
              </select>
            </div>

            <div class="field-block">
              <label class="field-label" for="repair-priority">Priority</label>
              <select id="repair-priority" bind:value={priority}>
                <option value="">Not prioritized</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <button class="btn-primary" type="submit">Save changes</button>
          </form>

          <div class="resolve-section">
            {#if resolving}
              <form onsubmit={resolveTicket}>
                <div class="field-block">
                  <label class="field-label" for="completion-notes">
                    Work completed
                  </label>
                  <textarea
                    id="completion-notes"
                    rows="4"
                    placeholder="Describe the repair and how you checked it."
                    bind:value={completionNotes}
                    required
                  ></textarea>
                </div>

                <button class="btn-primary" type="submit">
                  Confirm resolution
                </button>

                <button
                  class="btn-secondary cancel-button"
                  type="button"
                  onclick={() => {
                    resolving = false;
                    actionError = '';
                  }}
                >
                  Cancel
                </button>
              </form>
            {:else}
              <button
                class="btn-secondary"
                type="button"
                onclick={() => resolving = true}
              >
                Resolve ticket
              </button>
            {/if}
          </div>
        {/if}
      </section>
    </div>

    <section class="panel comments-panel" aria-labelledby="comments-title">
      <h2 id="comments-title" class="section-title">Comments and updates</h2>

      {#each ticket.comments || [] as item}
        <div class="comment" class:mine={item.author === technicianName}>
          <div class="who">
            <span class="name">{item.author}</span>
            <span class="when">
              {item.role === 'You' ? 'Reporter' : item.role} · {item.when}
            </span>
          </div>
          <div class="body comment-body">{item.body}</div>
        </div>
      {:else}
        <div class="empty-state">No comments yet.</div>
      {/each}

      <form class="comment-form" onsubmit={postComment}>
        <label class="field-label" for="repair-comment">Add an update</label>

        <textarea
          id="repair-comment"
          rows="3"
          placeholder="Share progress or ask for additional information."
          bind:value={comment}
          required
        ></textarea>

        <button class="btn-primary post-button" type="submit">
          Post comment
        </button>
      </form>
    </section>
  {/if}
</main>

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 20px;
    color: var(--ink);
    font-size: 13px;
    text-underline-offset: 3px;
  }

  .ticket-heading {
    margin-bottom: 22px;
  }

  h1 {
    margin: 6px 0 12px;
    font-size: 28px;
    overflow-wrap: anywhere;
  }

  .badge-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .priority-text {
    font-size: 12px;
    font-weight: 600;
  }

  .details-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 20px;
  }

  .panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .panel > .section-title {
    font-size: 19px;
    margin-bottom: 16px;
  }

  .description,
  .comment-body {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.6;
  }

  .description {
    margin: 0 0 18px;
  }

  .resolve-section {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
  }

  .cancel-button {
    margin-top: 8px;
  }

  .comments-panel {
    margin-top: 20px;
  }

  .comment-form {
    margin-top: 20px;
  }

  .post-button {
    width: auto;
    padding: 10px 18px;
    margin-top: 10px;
  }

  .action-error {
    color: var(--danger);
  }

  @media (max-width: 700px) {
    .details-columns {
      grid-template-columns: 1fr;
    }
  }
</style>