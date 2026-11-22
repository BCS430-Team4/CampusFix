<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { CampusFixAPI, type Ticket } from '$lib/api';
	import {
		buildAdminTicketPatch,
		DEMO_TECHNICIANS,
		TICKET_URGENCY_LEVELS,
		type AdminTicketChanges
	} from '$lib/admin-tickets';
	import { STATUS_COLOR } from '$lib/shared.js';

	let ticket = $state<Ticket | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let saveError = $state('');
	let savedMessage = $state('');
	let pending = $state<'assignment' | 'close' | 'comment' | null>(null);
	let busy = $derived(pending !== null);
	let commentDraft = $state('');
	let commentError = $state('');
	let commentMessage = $state('');
	let reloadCount = $state(0);
	let technician = $state('');
	let urgency = $state('');
	let finished = $derived(!!ticket && ['Resolved', 'Closed'].includes(ticket.status));
	let hasChanges = $derived(
		!!ticket && (technician !== (ticket.technician || '') || urgency !== (ticket.priority || ''))
	);
	let colors = $derived(
		STATUS_COLOR[(ticket?.status ?? 'Open') as keyof typeof STATUS_COLOR] || STATUS_COLOR.Open
	);

	function showTicket(found: Ticket) {
		ticket = found;
		technician = found.technician || '';
		urgency = found.priority || '';
	}

	$effect(() => {
		const id = page.params.id ?? '';
		void reloadCount;
		let active = true;
		ticket = null;
		loading = true;
		pending = null;
		commentDraft = '';
		commentError = '';
		commentMessage = '';
		loadError = '';
		saveError = '';
		savedMessage = '';
		CampusFixAPI.getTicket(id)
			.then((found) => {
				if (active && found) showTicket(found);
			})
			.catch(() => {
				if (active) loadError = 'Unable to load this ticket. Please try again.';
			})
			.finally(() => {
				if (active) loading = false;
			});
		return () => {
			active = false;
		};
	});

	function resetChanges() {
		if (ticket) showTicket(ticket);
		saveError = '';
		savedMessage = '';
	}

	async function saveChanges(event: SubmitEvent) {
		event.preventDefault();
		if (!ticket || busy || finished || !hasChanges) return;
		const id = ticket.id;
		const changes: AdminTicketChanges = {};
		if (technician !== (ticket.technician || '')) changes.technician = technician || null;
		if (urgency !== (ticket.priority || '')) changes.priority = urgency || null;
		pending = 'assignment';
		saveError = '';
		savedMessage = '';

		try {
			// Read the latest status so an urgency edit cannot undo a technician's progress.
			const current = await CampusFixAPI.getTicket(id);
			if (page.params.id !== id) return;
			if (!current) {
				ticket = null;
				return;
			}
			const patch = buildAdminTicketPatch(current, changes);
			const saved = Object.keys(patch).length
				? await CampusFixAPI.updateTicket(id, patch)
				: current;
			if (page.params.id !== id) return;
			if (!saved) {
				ticket = null;
				return;
			}
			showTicket(saved);
			savedMessage = 'Assignment and urgency saved.';
		} catch (error) {
			if (page.params.id !== id) return;
			saveError =
				error instanceof Error &&
				!error.message.startsWith('API Error:') &&
				!(error instanceof TypeError)
					? error.message
					: 'Unable to save changes. Your selections are still here; please try again.';
		} finally {
			if (page.params.id === id) pending = null;
		}
	}

	async function closeTicket() {
		if (!ticket || busy || ticket.status === 'Closed') return;
		const id = ticket.id;
		const question = hasChanges
			? `Close ${id} and discard unsaved assignment and urgency changes?`
			: `Close ticket ${id}?`;
		if (!window.confirm(question)) return;
		pending = 'close';
		savedMessage = '';
		saveError = '';
		try {
			const closed = await CampusFixAPI.updateTicket(id, { status: 'Closed' });
			if (page.params.id !== id) return;
			if (closed) {
				showTicket(closed);
				savedMessage = 'Ticket closed.';
			} else {
				ticket = null;
			}
		} catch {
			if (page.params.id === id) saveError = 'Unable to close this ticket. Please try again.';
		} finally {
			if (page.params.id === id) pending = null;
		}
	}

	async function postComment(event: SubmitEvent) {
		event.preventDefault();
		const body = commentDraft.trim();
		if (!ticket || busy || !body) return;
		const id = ticket.id;
		const editedTechnician = technician !== (ticket.technician || '');
		const editedUrgency = urgency !== (ticket.priority || '');
		pending = 'comment';
		commentError = '';
		commentMessage = '';
		try {
			const updated = await CampusFixAPI.addComment(
				id,
				body,
				'Campus Administrator',
				'Administrator'
			);
			if (page.params.id !== id) return;
			ticket = updated;
			if (updated) {
				if (!editedTechnician || finished) technician = updated.technician || '';
				if (!editedUrgency || finished) urgency = updated.priority || '';
				commentDraft = '';
				commentMessage = 'Comment posted.';
			}
		} catch {
			if (page.params.id === id) commentError = 'Unable to post your comment. Please try again.';
		} finally {
			if (page.params.id === id) pending = null;
		}
	}
</script>

<svelte:head>
	<title>{ticket?.title || 'Ticket details'} | CampusFix Administrator</title>
</svelte:head>

<main class="content admin-ticket-detail">
	<a class="back-link" href={resolve('/admin')}>← Back to admin dashboard</a>

	{#if loading}
		<p class="empty-state" role="status">Loading ticket…</p>
	{:else if loadError}
		<div class="notice-box" role="alert">
			<p>{loadError}</p>
			<button class="btn-secondary retry-button" type="button" onclick={() => reloadCount++}
				>Try again</button
			>
		</div>
	{:else if !ticket}
		<h1 class="headline">Ticket not found</h1>
		<p class="secondary-text">
			This ticket may have been removed. Return to the admin dashboard to choose another.
		</p>
	{:else}
		<header class="ticket-heading">
			<div>
				<div class="ticket-id">{ticket.id}</div>
				<h1 class="headline">{ticket.title}</h1>
			</div>
			<span class="status-badge" style:color={colors[0]} style:background={colors[1]}
				>{ticket.status}</span
			>
		</header>

		<div class="details-columns">
			<section class="panel" aria-labelledby="issue-title">
				<h2 id="issue-title" class="section-title">Issue details</h2>
				<dl class="meta-grid">
					<div>
						<dt>Category</dt>
						<dd>{ticket.category}</dd>
					</div>
					<div>
						<dt>Building</dt>
						<dd>{ticket.building || 'Not specified'}</dd>
					</div>
					<div>
						<dt>Room / location</dt>
						<dd>{ticket.room || 'Not specified'}</dd>
					</div>
					<div>
						<dt>Associated asset</dt>
						<dd>{ticket.asset || 'Not specified'}</dd>
					</div>
					<div>
						<dt>Reported</dt>
						<dd>{ticket.created}</dd>
					</div>
					<div>
						<dt>Last updated</dt>
						<dd>{ticket.updated}</dd>
					</div>
				</dl>
				<h3 class="subheading">Description</h3>
				<p class="description">{ticket.description || 'No description provided.'}</p>
				{#if ticket.location}
					<div class="local-location">
						<h3 class="subheading">Estimated map location</h3>
						<p>{ticket.location.latitude.toFixed(6)}, {ticket.location.longitude.toFixed(6)}</p>
						<p class="secondary-text">
							This pin is stored only in this browser and isn't shared with technicians yet.
						</p>
					</div>
				{/if}
				{#if ticket.completionNotes}
					<h3 class="subheading">Work completed</h3>
					<p class="description">{ticket.completionNotes}</p>
				{/if}
			</section>

			<section class="panel assignment-panel" aria-labelledby="assignment-title">
				<h2 id="assignment-title" class="section-title">Assignment & urgency</h2>
				{#if finished}
					<p class="field-help">
						This ticket is finished. Its assignment and urgency are kept with its repair history.
					</p>
				{:else}
					<p class="field-help">
						Choose who will handle this issue and how urgently it needs attention.
					</p>
				{/if}
				<form onsubmit={saveChanges} aria-busy={busy}>
					<fieldset disabled={busy || finished}>
						<legend class="sr-only">Ticket assignment and urgency</legend>
						<div class="field-block">
							<label class="field-label" for="admin-technician">Technician</label>
							<select
								id="admin-technician"
								bind:value={technician}
								aria-describedby="technician-help"
							>
								<option value="">Unassigned</option>
								{#each DEMO_TECHNICIANS as name (name)}<option value={name}>{name}</option>{/each}
								{#if ticket.technician && !DEMO_TECHNICIANS.includes(ticket.technician)}
									<option value={ticket.technician}>{ticket.technician} (currently assigned)</option
									>
								{/if}
							</select>
							<p id="technician-help" class="field-help">
								J. Delgado is the demo technician available right now.
							</p>
						</div>
						<div class="field-block">
							<label class="field-label" for="admin-urgency">Urgency</label>
							<select id="admin-urgency" bind:value={urgency} aria-describedby="urgency-help">
								<option value="">Not prioritized</option>
								{#each TICKET_URGENCY_LEVELS as level (level)}<option value={level}>{level}</option
									>{/each}
								{#if ticket.priority && !TICKET_URGENCY_LEVELS.includes(ticket.priority)}
									<option value={ticket.priority}>{ticket.priority} (current)</option>
								{/if}
							</select>
							<p id="urgency-help" class="field-help">
								Shown as priority in the technician dashboard.
							</p>
						</div>
					</fieldset>
					{#if saveError}<p class="action-error" role="alert">{saveError}</p>{/if}
					{#if savedMessage}<p class="save-confirmation" role="status">{savedMessage}</p>{/if}
					{#if !finished}
						<button class="btn-primary" type="submit" disabled={busy || !hasChanges}
							>{pending === 'assignment' ? 'Saving…' : 'Save changes'}</button
						>
						<button
							class="btn-secondary reset-button"
							type="button"
							disabled={busy || !hasChanges}
							onclick={resetChanges}>Reset changes</button
						>
					{/if}
				</form>
				{#if ticket.status !== 'Closed'}
					<button
						class="btn-secondary close-button"
						type="button"
						disabled={busy}
						onclick={closeTicket}
					>
						{pending === 'close' ? 'Closing…' : 'Close ticket'}
					</button>
				{/if}
			</section>
		</div>

		<section class="panel comments-panel" aria-labelledby="comments-title">
			<h2 id="comments-title" class="section-title">Comments & updates</h2>
			{#each ticket.comments as comment, index (comment.id ?? `${index}-${comment.author}-${comment.when}`)}
				<article class="ticket-comment">
					<div class="comment-meta">
						<strong>{comment.author}</strong><span>{comment.role} · {comment.when}</span>
					</div>
					<p class="description">{comment.body}</p>
				</article>
			{:else}
				<p class="secondary-text">No comments or repair updates yet.</p>
			{/each}
			<form class="comment-form" onsubmit={postComment} aria-busy={pending === 'comment'}>
				<label class="field-label" for="admin-comment">Add a comment</label>
				<textarea
					id="admin-comment"
					rows="3"
					bind:value={commentDraft}
					disabled={pending === 'comment'}></textarea>
				{#if commentError}<p class="action-error" role="alert">{commentError}</p>{/if}
				{#if commentMessage}<p class="save-confirmation" role="status">{commentMessage}</p>{/if}
				<button class="btn-primary" type="submit" disabled={busy || !commentDraft.trim()}>
					{pending === 'comment' ? 'Posting…' : 'Post comment'}
				</button>
			</form>
		</section>
	{/if}
</main>

<style>
	.admin-ticket-detail {
		max-width: 1120px;
		margin: 0 auto;
	}
	.back-link {
		display: inline-block;
		color: var(--green-accent);
		font-size: 13px;
		margin-bottom: 24px;
		text-underline-offset: 3px;
	}
	.ticket-heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 24px;
	}
	h1 {
		font-size: 28px;
		margin: 6px 0 0;
		overflow-wrap: anywhere;
	}
	.status-badge {
		font-size: 12px;
		font-weight: 600;
		padding: 6px 10px;
		border-radius: var(--radius);
		flex-shrink: 0;
	}
	.details-columns {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
		gap: 20px;
		align-items: start;
	}
	.panel {
		min-width: 0;
		padding: 22px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
	}
	.section-title {
		font-size: 20px;
		margin-bottom: 18px;
	}
	.meta-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
		margin: 0 0 24px;
		font-size: 14px;
	}
	dt {
		color: var(--secondary);
		font-size: 12px;
		margin-bottom: 5px;
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.subheading {
		font-size: 14px;
		margin: 20px 0 8px;
	}
	.description {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		line-height: 1.6;
		font-size: 14px;
		margin: 8px 0 0;
	}
	.local-location {
		border-top: 1px solid var(--border);
		margin-top: 20px;
		font-size: 13px;
		line-height: 1.5;
	}
	.field-help {
		color: var(--secondary);
		font-size: 12px;
		line-height: 1.5;
		margin: 8px 0 18px;
	}
	fieldset {
		padding: 0;
		margin: 0;
		border: 0;
		min-width: 0;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	select {
		min-height: 44px;
	}
	button {
		min-height: 44px;
	}
	button:disabled {
		opacity: 0.55;
		cursor: default;
	}
	select:disabled {
		opacity: 0.75;
	}
	.reset-button {
		margin-top: 10px;
	}
	.close-button {
		margin-top: 14px;
		color: var(--danger);
	}
	.comment-form {
		margin-top: 20px;
		border-top: 1px solid var(--border);
		padding-top: 16px;
	}
	.comment-form button {
		margin-top: 10px;
		width: auto;
	}
	.action-error,
	.save-confirmation {
		font-size: 13px;
		line-height: 1.5;
		padding: 12px;
		border-radius: var(--radius);
	}
	.action-error {
		color: var(--danger);
		background: var(--danger-bg);
	}
	.save-confirmation {
		color: var(--ink);
		background: var(--success-bg);
	}
	.retry-button {
		width: auto;
	}
	.comments-panel {
		margin-top: 20px;
	}
	.comments-panel > p {
		font-size: 14px;
	}
	.ticket-comment + .ticket-comment {
		border-top: 1px solid var(--border);
		margin-top: 18px;
		padding-top: 18px;
	}
	.comment-meta {
		display: flex;
		gap: 8px 16px;
		align-items: baseline;
		flex-wrap: wrap;
		font-size: 13px;
		overflow-wrap: anywhere;
	}
	.comment-meta span {
		color: var(--secondary);
		font-size: 12px;
	}
	@media (max-width: 760px) {
		.details-columns {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 420px) {
		.panel {
			padding: 16px;
		}
		.ticket-heading {
			flex-wrap: wrap;
		}
		.meta-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
