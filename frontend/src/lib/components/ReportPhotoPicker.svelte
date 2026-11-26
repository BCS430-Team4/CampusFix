<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		files = $bindable<File[]>([]),
		checking = $bindable(false),
		disabled = false
	}: { files?: File[]; checking?: boolean; disabled?: boolean } = $props();

	const types = ['image/jpeg', 'image/png', 'image/webp'];
	const limit = 4;
	let previews = $state.raw<{ file: File; url: string }[]>([]);
	let errors = $state<string[]>([]);
	let active = true;

	onDestroy(() => {
		active = false;
		for (const photo of previews) URL.revokeObjectURL(photo.url);
	});

	async function select(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selection = Array.from(input.files ?? []);
		input.value = '';
		errors = [];
		checking = true;
		try {
			for (const file of selection) {
				if (previews.length >= limit) {
					errors.push('You can attach up to four photos. Remove one to choose another.');
					break;
				}
				if (!types.includes(file.type) || file.size > 5 * 1024 * 1024) {
					errors.push(file.name + ' must be a JPEG, PNG, or WebP image of 5 MB or less.');
					continue;
				}
				if (
					files.some(
						(item) =>
							item.name === file.name &&
							item.size === file.size &&
							item.lastModified === file.lastModified
					)
				)
					continue;
				const url = URL.createObjectURL(file);
				const image = new Image();
				image.src = url;
				try {
					await image.decode();
				} catch {
					URL.revokeObjectURL(url);
					errors.push('Could not open ' + file.name + '. Choose another photo.');
					continue;
				}
				if (!active) {
					URL.revokeObjectURL(url);
					break;
				}
				previews = [...previews, { file, url }];
				files = [...files, file];
			}
		} finally {
			checking = false;
		}
	}

	function remove(file: File) {
		const preview = previews.find((item) => item.file === file);
		if (preview) URL.revokeObjectURL(preview.url);
		previews = previews.filter((item) => item.file !== file);
		files = files.filter((item) => item !== file);
		errors = [];
	}
</script>

<label class="field-label" for="report-photos">Photos (optional)</label>
<div class="dropzone">
	<Icon name="camera" size={24} />
	<span id="photo-help">Choose up to four JPEG, PNG, or WebP photos, 5 MB each.</span>
	<input
		id="report-photos"
		type="file"
		accept={types.join(',')}
		multiple
		aria-describedby="photo-help photo-storage"
		disabled={disabled || checking}
		onchange={select}
	/>
</div>
<p id="photo-storage">
	Photos are saved in this browser. Staff can view them here when they open the ticket.
</p>
{#if errors.length}<div class="field-error" role="alert">{errors.join(' ')}</div>{/if}
{#if previews.length}
	<ul aria-label="Selected photos">
		{#each previews as { file, url } (url)}
			<li>
				<img src={url} alt="" />
				<span>{file.name}</span>
				<button
					type="button"
					aria-label={'Remove ' + file.name}
					disabled={disabled || checking}
					onclick={() => remove(file)}>Remove</button
				>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.dropzone,
	p,
	li {
		font-size: 13px;
	}
	p {
		color: var(--secondary);
		line-height: 1.5;
		margin: 8px 0;
	}
	ul {
		list-style: none;
		margin: 12px 0;
		padding: 0;
		display: grid;
		gap: 6px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px;
		border-bottom: 1px solid var(--border);
	}
	li img {
		width: 54px;
		height: 42px;
		border-radius: 4px;
		object-fit: cover;
	}
	li span {
		flex: 1;
		overflow-wrap: anywhere;
	}
	li button {
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 8px;
		font: inherit;
		cursor: pointer;
	}
</style>
