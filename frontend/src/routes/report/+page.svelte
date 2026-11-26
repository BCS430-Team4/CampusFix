<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CampusFixAPI, type Ticket } from '$lib/api';
	import { BUILDINGS, CATEGORIES } from '$lib/shared.js';
	import Topbar from '$lib/components/Topbar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import LocationPicker from '$lib/components/LocationPicker.svelte';
	import ReportPhotoPicker from '$lib/components/ReportPhotoPicker.svelte';
	import type { CreateTicketInput, TicketLocation } from '$lib/types/ticket-location';

	let category = $state('');
	let title = $state('');
	let description = $state('');
	let building = $state('');
	let room = $state('');
	let photoFiles = $state.raw<File[]>([]);
	let checkingPhotos = $state(false);
	let createdTicket = $state.raw<Ticket | null>(null);
	let errors = $state({ category: false, title: false });
	let location = $state<TicketLocation | null>(null);
	let showLocationPicker = $state(false);
	let locationButton: HTMLButtonElement;
	let submitting = $state(false);
	let submitError = $state('');
	const notify = getContext<(text: string) => void>('notify');

	async function closeLocationPicker() {
		showLocationPicker = false;
		await tick();
		locationButton?.focus();
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting || checkingPhotos) return;
		submitError = '';
		errors = { category: !category, title: !title.trim() };
		if (errors.category || errors.title) return;
		const input: CreateTicketInput = {
			title: title.trim(),
			description: description.trim(),
			category,
			building,
			room,
			location
		};
		submitting = true;
		try {
			const ticket = createdTicket ?? (await CampusFixAPI.addTicket(input));
			createdTicket = ticket;
			if (photoFiles.length) {
				try {
					await CampusFixAPI.saveTicketPhotos(ticket, photoFiles);
				} catch {
					submitError =
						'Ticket ' +
						ticket.id +
						' was created. This browser could not save the photos. Retry or open the ticket without them.';
					return;
				}
			}
			await goto(resolve('/tickets/[id]', { id: ticket.id }));
			notify(
				location && !ticket.location
					? 'Report saved, but the pin could not be stored in this browser.'
					: 'Report submitted'
			);
		} catch {
			submitError = createdTicket
				? 'Your report was saved. Open the ticket below.'
				: 'Unable to submit your report. Your entries are still here. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Report an issue — CampusFix</title></svelte:head>

<Topbar title="Report an issue" />
<main class="content">
	<form onsubmit={submit} aria-busy={submitting} novalidate>
		<fieldset class="report-details" disabled={submitting || !!createdTicket}>
			<fieldset class="category-field">
				<legend class="field-label">Category</legend>
				<div class="cat-grid">
					{#each CATEGORIES as item (item.label)}
						<button
							type="button"
							class="cat-btn"
							class:selected={category === item.label}
							aria-pressed={category === item.label}
							onclick={() => {
								category = item.label;
								errors.category = false;
							}}
						>
							<Icon name={item.icon} size={22} /><span>{item.label}</span>
						</button>
					{/each}
				</div>
				{#if errors.category}<div class="field-error" role="alert">
						Select a category first.
					</div>{/if}
			</fieldset>
			<div class="field-block">
				<label class="field-label" for="report-title">Title</label>
				<input
					id="report-title"
					type="text"
					placeholder="ex: Flickering lights in lab"
					bind:value={title}
					aria-invalid={errors.title}
				/>
				{#if errors.title}<div class="field-error" role="alert">Enter a short title.</div>{/if}
			</div>
			<div class="field-block">
				<label class="field-label" for="report-description">Description</label>
				<textarea
					id="report-description"
					rows="3"
					placeholder="Describe what's wrong and where exactly to find it"
					bind:value={description}></textarea>
			</div>
			<div class="location-fields">
				<div>
					<label class="field-label" for="report-building"
						>Building <span class="optional">(optional)</span></label
					><select id="report-building" aria-describedby="report-outdoor-help" bind:value={building}
						><option value="">Select a building</option>{#each BUILDINGS as name (name)}<option
								>{name}</option
							>{/each}</select
					>
				</div>
				<div>
					<label class="field-label" for="report-room"
						>Room / location <span class="optional">(optional)</span></label
					><input
						id="report-room"
						type="text"
						placeholder="ex: Room 204 or parking lot"
						aria-describedby="report-outdoor-help"
						bind:value={room}
					/>
				</div>
				<p id="report-outdoor-help" class="outdoor-help">
					For outdoor issues, leave Building blank and describe the spot or add a map pin.
				</p>
			</div>
			<section class="map-location-field" aria-labelledby="report-map-label">
				<h2 class="field-label" id="report-map-label">
					Map location <span class="optional">(optional)</span>
				</h2>
				<p class="location-help">Help us find the issue. Your best estimate is fine.</p>
				<p class="location-help">
					Map pins are saved only in this browser and aren't shared with other devices yet.
				</p>
				{#if location}<p class="location-saved" role="status">
						<Icon name="map-pin" size={18} /><span>Approximate location added</span>
					</p>{/if}
				<div class="location-actions">
					<button
						type="button"
						class="btn-secondary map-button"
						bind:this={locationButton}
						onclick={() => (showLocationPicker = true)}
						aria-haspopup="dialog"
						><Icon name="map-pin" size={18} />{location
							? 'Change location'
							: 'Choose on map'}</button
					>
					{#if location}<button
							type="button"
							class="remove-location"
							onclick={() => {
								location = null;
								locationButton.focus();
							}}>Remove location</button
						>{/if}
				</div>
			</section>
		</fieldset>
		<ReportPhotoPicker
			bind:files={photoFiles}
			bind:checking={checkingPhotos}
			disabled={submitting}
		/>
		{#if submitError}<div class="notice-box" role="alert">{submitError}</div>{/if}
		<button
			class="btn-primary"
			style="margin-top:20px;"
			type="submit"
			disabled={submitting || checkingPhotos}
			>{submitting ? 'Saving…' : createdTicket ? 'Retry save' : 'Submit report'}</button
		>
		{#if createdTicket && submitError}
			<a class="ticket-link" href={resolve('/tickets/[id]', { id: createdTicket.id })}
				>Open ticket {createdTicket.id}</a
			>
		{/if}
	</form>
</main>

{#if showLocationPicker}
	<LocationPicker
		{location}
		{building}
		oncancel={closeLocationPicker}
		onconfirm={(point) => {
			location = point;
			void closeLocationPicker();
		}}
	/>
{/if}

<style>
	.report-details {
		min-width: 0;
		padding: 0;
		margin: 0;
		border: 0;
	}
	.ticket-link {
		display: block;
		margin-top: 12px;
		color: var(--ink);
		text-align: center;
	}
	.map-location-field {
		margin-bottom: 22px;
	}
	h2 {
		margin-top: 0;
	}
	.optional {
		font-weight: 400;
		color: var(--secondary);
	}
	.outdoor-help {
		grid-column: 1 / -1;
		margin: 0;
		color: var(--secondary);
		font-size: 12px;
		line-height: 1.5;
	}
	.location-help {
		margin: 0 0 12px;
		color: var(--secondary);
		font-size: 13px;
	}
	.location-actions {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.map-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: auto;
		padding-inline: 14px;
		min-height: 44px;
	}
	.location-saved {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 10px;
		padding: 10px 12px;
		border-radius: var(--radius);
		background: var(--green-tint-bg);
		color: var(--green-tint-text);
		font-size: 13px;
	}
	.remove-location {
		border: 0;
		padding: 10px 0;
		min-height: 44px;
		background: none;
		color: var(--secondary);
		font: inherit;
		font-size: 13px;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
</style>
