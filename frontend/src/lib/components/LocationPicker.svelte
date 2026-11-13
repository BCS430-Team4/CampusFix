<script lang="ts">
	import { onMount } from 'svelte';
	import type { LatLng, LeafletMouseEvent, Map as LeafletMap, Marker, TileLayer } from 'leaflet';
	import {
		CAMPUS_BOUNDS,
		CAMPUS_BUILDINGS,
		CAMPUS_TILE_URL,
		CAMPUS_TILE_OPTIONS
	} from '$lib/campus.js';
	import type { TicketLocation } from '$lib/types/ticket-location';
	import 'leaflet/dist/leaflet.css';

	interface Props {
		location: TicketLocation | null;
		building: string;
		onconfirm: (location: TicketLocation) => void;
		oncancel: () => void;
	}

	let { location, building, onconfirm, oncancel }: Props = $props();
	let dialog: HTMLDialogElement;
	let mapElement: HTMLDivElement;
	let map = $state.raw<LeafletMap | null>(null);
	let draftLocation = $state<TicketLocation | null>(null);
	let mapFailed = $state(false);
	let tileError = $state(false);
	let leaflet: typeof import('leaflet') | undefined;
	let marker: Marker | undefined;
	let tiles: TileLayer | undefined;

	function placePin(position: LatLng) {
		if (!map || !leaflet) return;
		const point = position.wrap();
		draftLocation = { latitude: point.lat, longitude: point.lng, isApproximate: true };
		if (marker) {
			marker.setLatLng(point);
		} else {
			marker = leaflet
				.marker(point, {
					draggable: true,
					// Leaflet 1.9 can leave auto-pan queued if the dialog closes mid-drag.
					autoPan: false,
					title: 'Approximate issue location — drag to move',
					alt: 'Approximate issue location',
					icon: leaflet.divIcon({
						className: 'report-location-marker',
						html: '<span class="report-location-pin"><span></span></span>',
						iconSize: [34, 42],
						iconAnchor: [17, 42]
					})
				})
				.addTo(map);
			marker.on('dragend', () => {
				if (marker) placePin(marker.getLatLng());
			});
		}
	}

	function confirmLocation() {
		if (draftLocation && !mapFailed) onconfirm({ ...draftLocation });
	}

	onMount(() => {
		let disposed = false;
		let instance: LeafletMap | undefined;
		let observer: ResizeObserver | undefined;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialog.showModal();

		void (async () => {
			try {
				leaflet = await import('leaflet');
				if (disposed) return;
				instance = leaflet.map(mapElement, { minZoom: 14, maxZoom: 19, scrollWheelZoom: true });
				const selectedBuilding = CAMPUS_BUILDINGS.find((item) => item.name === building);
				if (location) instance.setView([location.latitude, location.longitude], 18);
				else if (selectedBuilding) instance.setView(selectedBuilding.position, 18);
				else instance.fitBounds(CAMPUS_BOUNDS, { padding: [20, 20] });

				tiles = leaflet.tileLayer(CAMPUS_TILE_URL, CAMPUS_TILE_OPTIONS).addTo(instance);
				tiles.on('tileerror', () => {
					if (!disposed) tileError = true;
				});
				instance.on('click', (event: LeafletMouseEvent) => placePin(event.latlng));
				observer = new ResizeObserver(() => instance?.invalidateSize());
				observer.observe(mapElement);
				map = instance;
				if (location) placePin(leaflet.latLng(location.latitude, location.longitude));
			} catch {
				if (!disposed) mapFailed = true;
			}
		})();

		return () => {
			disposed = true;
			observer?.disconnect();
			instance?.remove();
			if (dialog.open) dialog.close();
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="location-picker-title"
	aria-describedby="location-picker-help"
	{oncancel}
>
	<div class="picker-body">
		<h2 id="location-picker-title" class="headline">Where is the issue?</h2>
		<p id="location-picker-help">
			Tap the map to place a pin, then drag it or tap elsewhere to adjust. Your best estimate is
			fine.
		</p>
		<div class="map-frame">
			<div
				bind:this={mapElement}
				class="location-map"
				role="region"
				aria-label="Interactive Farmingdale campus location picker"
				aria-describedby="location-keyboard-help"
			></div>
			{#if !map && !mapFailed}<div class="map-loading" role="status">Loading campus map…</div>{/if}
		</div>
		{#if mapFailed}
			<p class="map-notice" role="status">
				The map couldn’t load. Close this window and try again, or submit your report without a pin.
			</p>
		{:else if tileError}
			<p class="map-notice" role="status">
				Some map imagery couldn’t load. <button
					type="button"
					class="text-button"
					onclick={() => {
						tileError = false;
						tiles?.redraw();
					}}>Retry imagery</button
				> You can also cancel and submit without a pin.
			</p>
		{/if}
		<div class="selection-row">
			<p class="pin-status" role="status">
				{draftLocation ? 'Approximate location selected' : 'No pin placed yet'}
			</p>
			<button
				type="button"
				class="center-button"
				disabled={!map || mapFailed}
				onclick={() => {
					if (map) placePin(map.getCenter());
				}}>Place pin at center</button
			>
		</div>
		<p id="location-keyboard-help" class="keyboard-help">
			Using a keyboard? Focus the map and use the arrow keys to move, then choose “Place pin at
			center.”
		</p>
		<p class="room-reminder">
			Add building and room details in the form to help us find the exact spot.
		</p>
	</div>
	<div class="picker-actions">
		<button type="button" class="btn-secondary" onclick={oncancel}>Cancel</button>
		<button
			type="button"
			class="btn-primary"
			disabled={!draftLocation || mapFailed}
			onclick={confirmLocation}>Use this location</button
		>
	</div>
</dialog>

<style>
	dialog {
		width: min(700px, calc(100% - 32px));
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
		color: var(--ink);
		overflow: hidden;
	}
	dialog[open] {
		display: flex;
		flex-direction: column;
	}
	dialog::backdrop {
		background: rgb(0 20 17 / 55%);
	}
	.picker-body {
		flex: 1 1 auto;
		min-height: 0;
		padding: 22px 22px 16px;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	h2 {
		margin: 0 0 6px;
		font-size: 26px;
	}
	#location-picker-help {
		margin: 0 0 16px;
		color: var(--secondary);
		font-size: 14px;
		line-height: 1.5;
	}
	.map-frame {
		position: relative;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		isolation: isolate;
	}
	.location-map {
		width: 100%;
		height: clamp(240px, 44dvh, 380px);
		background: var(--bg-alt);
	}
	.map-loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: var(--bg-alt);
		color: var(--secondary);
		font-size: 13px;
	}
	.selection-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 12px;
		flex-wrap: wrap;
	}
	.pin-status {
		margin: 0;
		font-size: 13px;
		color: var(--secondary);
	}
	.center-button {
		padding: 9px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}
	.keyboard-help,
	.room-reminder {
		margin: 10px 0 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--secondary);
	}
	.map-notice {
		margin: 12px 0 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--secondary);
	}
	.text-button {
		border: 0;
		padding: 0;
		background: none;
		color: var(--green-accent);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
	.picker-actions {
		flex-shrink: 0;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 22px;
		border-top: 1px solid var(--border);
		background: var(--bg);
		z-index: 2;
	}
	.picker-actions button {
		width: auto;
		padding-inline: 18px;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	:global(.report-location-marker) {
		background: none;
		border: 0;
	}
	:global(.report-location-pin) {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		background: var(--green);
		border: 2px solid #fff;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		box-shadow: 0 2px 5px #0004;
	}
	:global(.report-location-pin > span) {
		width: 9px;
		height: 9px;
		border: 2px solid #fff;
		border-radius: 50%;
	}
	.location-map :global(.leaflet-control-attribution) {
		font-family: inherit;
	}
	@media (max-width: 480px) {
		dialog {
			width: calc(100% - 20px);
			max-height: calc(100dvh - 20px);
		}
		.picker-body {
			padding: 18px 16px 14px;
		}
		.picker-actions {
			padding: 14px 16px;
		}
		.picker-actions .btn-primary {
			flex: 1;
		}
		.center-button,
		.picker-actions button {
			min-height: 44px;
		}
		.selection-row {
			align-items: stretch;
			flex-direction: column;
		}
	}
	@media (max-width: 640px) {
		.location-map :global(.leaflet-control-zoom a) {
			width: 44px;
			height: 44px;
			line-height: 44px;
		}
	}
	@media (max-height: 500px) {
		.location-map {
			height: 160px;
		}
	}
</style>
