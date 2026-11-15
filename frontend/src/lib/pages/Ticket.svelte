<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { CampusFixAPI, type Ticket } from '../api';
	import { STATUS_COLOR } from '../shared.js';
	import Topbar from '../components/Topbar.svelte';
	import Icon from '../components/Icon.svelte';
	let {
		id,
		justSubmitted = false,
		notify
	}: { id: string; justSubmitted?: boolean; notify: (text: string) => void } = $props();
	let ticket = $state<Ticket | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let actionError = $state('');
	let busy = $state(false);
	let editing = $state(false);
	let title = $state('');
	let description = $state('');
	let comment = $state('');
	let colors = $derived(
		STATUS_COLOR[(ticket?.status ?? 'Open') as keyof typeof STATUS_COLOR] || STATUS_COLOR.Open
	);

	onMount(async () => {
		try {
			ticket = await CampusFixAPI.getTicket(id);
			if (ticket && justSubmitted) notify('Report submitted');
		} catch {
			loadError = 'Unable to load this ticket. Please refresh and try again.';
		} finally {
			loading = false;
		}
	});

	function edit() {
		if (!ticket || busy) return;
		title = ticket.title;
		description = ticket.description;
		editing = true;
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (!title.trim()) {
			notify("Title can't be empty");
			return;
		}
		if (!ticket || ticket.status !== 'Open' || busy) return;
		actionError = '';
		busy = true;
		try {
			const updated = await CampusFixAPI.updateTicket(id, {
				title: title.trim(),
				description: description.trim()
			});
			if (!updated) throw new Error('Ticket missing');
			ticket = updated;
			editing = false;
			notify('Changes saved');
		} catch {
			actionError = 'Unable to save changes. Your edits are still here; please try again.';
		} finally {
			busy = false;
		}
	}

	async function cancel() {
		if (
			!ticket ||
			busy ||
			ticket.status !== 'Open' ||
			!confirm("Cancel this report? This can't be undone.")
		)
			return;
		actionError = '';
		busy = true;
		try {
			const updated = await CampusFixAPI.updateTicket(id, { status: 'Closed' });
			if (!updated) throw new Error('Ticket missing');
			ticket = updated;
			let message = 'Report cancelled';
			try {
				await CampusFixAPI.addComment(id, 'Report cancelled by reporter.');
			} catch {
				message = 'Report cancelled, but the cancellation comment could not be saved.';
			}
			await goto(resolve('/my-tickets'));
			notify(message);
		} catch {
			actionError = 'Unable to cancel your report. Please try again.';
		} finally {
			busy = false;
		}
	}

	async function send(event: SubmitEvent) {
		event.preventDefault();
		if (!comment.trim() || busy) return;
		actionError = '';
		busy = true;
		try {
			const updated = await CampusFixAPI.addComment(id, comment.trim());
			if (!updated) throw new Error('Ticket missing');
			ticket = updated;
			comment = '';
		} catch {
			actionError = 'Unable to post your comment. Your text is still here; please try again.';
		} finally {
			busy = false;
		}
	}
</script>

<Topbar
	title={ticket?.title || (loading ? 'Loading ticket…' : 'Ticket not found')}
	idLabel={ticket?.id || ''}
	backHref="/my-tickets"
/>
<main class="content">
	{#if actionError}<div class="notice-box" role="alert">{actionError}</div>{/if}
	{#if loading}<div class="empty-state" role="status">Loading ticket…</div>
	{:else if loadError}<div class="notice-box" role="alert">{loadError}</div>
	{:else if !ticket}<div class="empty-state">This ticket wasn't found in the database.</div>
	{:else if editing}
		<form onsubmit={save} novalidate>
			<div class="field-block">
				<label class="field-label" for="edit-title">Title</label><input
					id="edit-title"
					type="text"
					bind:value={title}
				/>
			</div>
			<div class="field-block">
				<label class="field-label" for="edit-description">Description</label><textarea
					id="edit-description"
					rows="3"
					bind:value={description}></textarea>
			</div>
			<button class="btn-primary" style="margin-bottom:8px;" type="submit" disabled={busy}
				>{busy ? 'Saving…' : 'Save changes'}</button
			>
			<button class="btn-secondary" type="button" disabled={busy} onclick={() => (editing = false)}
				>Cancel</button
			>
		</form>
	{:else}
		<div style="margin-bottom:18px;">
			<span class="status-badge" style:color={colors[0]} style:background={colors[1]}
				>{ticket.status}</span
			>
			{#if ticket.priority}<span
					class="status-badge"
					style="color:var(--warning);background:var(--warning-bg);margin-left:8px;"
					>{ticket.priority} priority</span
				>{/if}
		</div>
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
				<div class="v">{ticket.technician || 'Not yet assigned'}</div>
			</div>
			<div>
				<div class="k">Associated asset</div>
				<div class="v">{ticket.asset || '—'}</div>
			</div>
			<div>
				<div class="k">Created</div>
				<div class="v">{ticket.created}</div>
			</div>
			<div>
				<div class="k">Last updated</div>
				<div class="v">{ticket.updated}</div>
			</div>
		</div>
		<h2 class="section-title">Description</h2>
		{#if ticket.location}<p class="notice-box">
				Approximate map pin saved on this browser only. It isn't shared with other devices yet.
			</p>{/if}
		<div
			class="secondary-text"
			style="font-size:13px;line-height:1.5;margin-bottom:20px;white-space:pre-wrap;"
		>
			{ticket.description || 'No description provided.'}
		</div>
		{#if ticket.status === 'Open'}
			<button class="btn-secondary" style="margin-bottom:8px;" onclick={edit} disabled={busy}
				>Edit report</button
			>
			<button class="btn-text-danger" style="margin-bottom:20px;" onclick={cancel} disabled={busy}
				>Cancel report</button
			>
		{:else}
			<div class="notice-box">
				<Icon name="lock" size={18} /> This report is locked. Use comments for updates.
			</div>
		{/if}
		<h2 class="section-title">Comments</h2>
		{#each ticket.comments as item, index (item.id ?? index)}
			<div class="comment" class:mine={item.role === 'You'}>
				<div class="who">
					<span class="name">{item.author}</span><span class="when">{item.role} · {item.when}</span>
				</div>
				<div class="body" style="white-space:pre-wrap;">{item.body}</div>
			</div>
		{:else}<div class="empty-state" style="padding:12px 0;">No comments yet.</div>{/each}
		<form class="comment-input-row" style="margin-top:12px;" onsubmit={send}>
			<input
				type="text"
				aria-label="Add a comment"
				placeholder="Add a comment"
				bind:value={comment}
				disabled={busy}
			/>
			<button type="submit" disabled={busy}>Send</button>
		</form>
	{/if}
</main>
