<script lang="ts">
	import { tick } from 'svelte';
	import { CampusFixAPI, type Ticket } from '$lib/api';
	import Icon from './Icon.svelte';

	let { ticket }: { ticket: Pick<Ticket, 'id' | 'created'> } = $props();
	let photos = $state.raw<{ name: string; url: string }[]>([]);
	let error = $state(false);
	let selected = $state<number | null>(null);
	let originalButton: HTMLButtonElement;
	let closeButton = $state<HTMLButtonElement>();
	let viewer = $state<HTMLElement>();
	let current = $derived(selected === null ? undefined : photos[selected]);

	$effect(() => {
		const identity = { id: ticket.id, created: ticket.created };
		let active = true;
		const urls: string[] = [];
		selected = null;
		error = false;
		photos = [];
		CampusFixAPI.getTicketPhotos(identity)
			.then((files) => {
				if (!active) return;
				photos = files.map((file) => {
					const url = URL.createObjectURL(file);
					urls.push(url);
					return { name: file.name, url };
				});
			})
			.catch(() => {
				if (active) error = true;
			});
		return () => {
			active = false;
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	async function open(index: number, button: HTMLButtonElement) {
		originalButton = button;
		selected = index;
		await tick();
		closeButton?.focus();
	}

	function close() {
		selected = null;
		originalButton?.focus();
	}

	function move(step: number) {
		if (selected === null) return;
		selected = Math.max(0, Math.min(photos.length - 1, selected + step));
		if (selected === 0 || selected === photos.length - 1)
			closeButton?.focus({ preventScroll: true });
	}

	function handleKey(event: KeyboardEvent) {
		if (selected === null || !viewer?.contains(document.activeElement)) return;
		if (event.key === 'Escape') close();
		else if (event.key === 'ArrowLeft') move(-1);
		else if (event.key === 'ArrowRight') move(1);
		else return;
		event.preventDefault();
	}
</script>

<svelte:window onkeydown={handleKey} />
{#if photos.length}
	<section class="photos" aria-label="Report photos">
		<div class="heading">
			<h3 class="section-title">Report photos</h3>
			<span>{photos.length} {photos.length === 1 ? 'attachment' : 'attachments'}</span>
		</div>
		<div class="grid">
			{#each photos as photo, index (photo.url)}
				<button
					class="photo"
					type="button"
					aria-label={'Enlarge ' + photo.name}
					aria-expanded={selected === index}
					onclick={(event) => open(index, event.currentTarget)}
				>
					<img src={photo.url} alt="" />
					<span class="caption">{photo.name}<Icon name="expand" size={16} /></span>
				</button>
			{/each}
		</div>
		{#if current && selected !== null}
			<section class="viewer" aria-label="Enlarged photo" bind:this={viewer}>
				<div class="controls">
					<strong>{current.name}</strong>
					<button type="button" bind:this={closeButton} onclick={close}>Close photo</button>
				</div>
				<img class="large" src={current.url} alt={'Report photo: ' + current.name} />
				{#if photos.length > 1}
					<div class="controls navigation">
						<button type="button" disabled={selected === 0} onclick={() => move(-1)}
							>Previous</button
						>
						<span aria-live="polite">Photo {selected + 1} of {photos.length}</span>
						<button type="button" disabled={selected === photos.length - 1} onclick={() => move(1)}
							>Next</button
						>
					</div>
				{/if}
			</section>
		{/if}
	</section>
{:else if error}
	<p class="secondary-text" role="status">Photo storage is unavailable in this browser.</p>
{/if}

<style>
	.photos {
		margin: 16px 0;
		padding-top: 14px;
		border-top: 1px solid var(--border);
	}
	.heading,
	.caption,
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.heading {
		margin-bottom: 10px;
	}
	.heading h3 {
		margin: 0;
	}
	.heading span,
	.navigation span {
		color: var(--secondary);
		font-size: 12px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	button {
		background: var(--bg);
		color: var(--ink);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font: inherit;
		cursor: pointer;
	}
	button:hover:enabled {
		border-color: var(--green-accent);
	}
	.photo {
		display: block;
		padding: 0;
		overflow: hidden;
		text-align: left;
		min-width: 0;
	}
	.photo img {
		width: 100%;
		aspect-ratio: 1.85;
		display: block;
		object-fit: cover;
	}
	.caption,
	.controls {
		padding: 8px 10px;
		font-size: 13px;
		overflow-wrap: anywhere;
	}
	.viewer {
		margin-top: 12px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.controls button {
		flex: none;
		padding: 6px 10px;
		min-height: 36px;
		font-weight: 600;
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.large {
		display: block;
		width: 100%;
		max-height: 65vh;
		object-fit: contain;
		background: #18221f;
	}
	@media (pointer: coarse) {
		.controls button {
			min-height: 44px;
		}
	}
</style>
