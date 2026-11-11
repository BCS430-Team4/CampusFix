<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.js';
  import { CAMPUS_BUILDINGS, CAMPUS_BOUNDS } from '$lib/campus.js';
  import TicketRow from '$lib/components/TicketRow.svelte';
  import 'leaflet/dist/leaflet.css';

  const tickets = CampusFixAPI.getTickets();
  let showAll = $state(false);
  let selected = $state('');
  let mapElement;
  let map = $state.raw(null);
  let mapFailed = $state(false);
  let tileError = $state(false);
  let L;
  let markerLayer;
  let tiles;

  let visible = $derived(tickets.filter(ticket => showAll || ['Open', 'Assigned', 'In progress'].includes(ticket.status)));
  let buildings = $derived(CAMPUS_BUILDINGS.map(building => ({ ...building, tickets: visible.filter(ticket => ticket.building === building.name) })).filter(building => building.tickets.length));
  let unmapped = $derived(visible.filter(ticket => !CAMPUS_BUILDINGS.some(building => building.name === ticket.building)));
  let selectedTickets = $derived(visible.filter(ticket => ticket.building === selected));

  function choose(building) {
    selected = building.name;
    map?.panTo(building.position);
  }

  function setFilter(all) {
    showAll = all;
    selected = '';
  }

  function reset() {
    selected = '';
    map?.fitBounds(CAMPUS_BOUNDS, { padding: [18, 18] });
  }

  onMount(() => {
    let disposed = false;
    let observer;
    let instance;

    (async () => {
      try {
        const module = await import('leaflet');
        if (disposed) return;
        L = module.default || module;
        instance = L.map(mapElement, { scrollWheelZoom: false, minZoom: 14, maxZoom: 19 });
        instance.fitBounds(CAMPUS_BOUNDS, { padding: [18, 18] });
        tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(instance);
        tiles.on('tileerror', () => tileError = true);
        markerLayer = L.layerGroup().addTo(instance);
        observer = new ResizeObserver(() => instance.invalidateSize());
        observer.observe(mapElement);
        map = instance;
      } catch {
        if (!disposed) mapFailed = true;
      }
    })();

    return () => {
      disposed = true;
      observer?.disconnect();
      instance?.remove();
    };
  });

  $effect(() => {
    if (!map) return;
    markerLayer.clearLayers();
    for (const building of buildings) {
      const pin = document.createElement('span');
      pin.className = 'pin-count';
      const count = document.createElement('span');
      count.className = 'pin-number';
      count.textContent = String(building.tickets.length);
      pin.appendChild(count);
      const label = building.name + ': ' + building.tickets.length + ' report' + (building.tickets.length === 1 ? '' : 's');
      const marker = L.marker(building.position, {
        icon: L.divIcon({ className: 'issue-pin', html: pin, iconSize: [34, 42], iconAnchor: [17, 42] }),
        title: label,
        alt: label,
        keyboard: true
      }).addTo(markerLayer);
      marker.on('click', () => choose(building));
      marker.bindTooltip(building.name, { direction: 'top', offset: [0, -34] });
    }
  });
</script>

<svelte:head><title>Campus map — CampusFix</title></svelte:head>
<main class="content">
  <div class="map-heading">
    <div><h1 class="headline">Campus map</h1><p class="secondary-text">Farmingdale State College</p></div>
    <button class="reset-button" onclick={reset} disabled={!map}>Reset view</button>
  </div>
  <div class="filter-row" aria-label="Map report filters">
    <button class="chip" class:active={!showAll} aria-pressed={!showAll} onclick={() => setFilter(false)}>Active reports</button>
    <button class="chip" class:active={showAll} aria-pressed={showAll} onclick={() => setFilter(true)}>All reports</button>
  </div>
  <div class="map-frame">
    <div bind:this={mapElement} class="campus-map" role="region" aria-label="Interactive Farmingdale campus map"></div>
    {#if !map && !mapFailed}<div class="map-loading" role="status">Loading campus map…</div>{/if}
  </div>
  {#if mapFailed}
    <p class="notice-box" role="status">The map couldn’t load. You can still select a building below.</p>
  {:else if tileError}
    <div class="tile-notice" role="status">Some map imagery couldn’t load. Pins and report lists still work. <button onclick={() => { tileError = false; tiles?.redraw(); }}>Retry imagery</button></div>
  {/if}
  <h2 class="section-title">Buildings with reports</h2>
  <div class="building-list">
    {#each buildings as building}
      <button class="building-button" class:selected={selected === building.name} aria-pressed={selected === building.name} onclick={() => choose(building)}>
        <span>{building.name}</span><span class="building-count">{building.tickets.length}</span>
      </button>
    {:else}<div class="empty-state">No mapped reports in this view.</div>{/each}
  </div>
  {#if selected}
    <section class="building-details" aria-label={'Reports at ' + selected} aria-live="polite">
      <h2 class="section-title">{selected}</h2>
      {#each selectedTickets as ticket (ticket.id)}<TicketRow {ticket} />{/each}
    </section>
  {/if}
  {#if unmapped.length}
    <details class="unmapped">
      <summary>{unmapped.length} report{unmapped.length === 1 ? '' : 's'} without a mapped building</summary>
      <p class="secondary-text">These locations haven’t been confirmed yet.</p>
      {#each unmapped as ticket (ticket.id)}<TicketRow {ticket} />{/each}
    </details>
  {/if}
</main>

<style>
  .map-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  h1 { margin: 0; font-size: 24px; }
  .map-heading p { margin: 3px 0 0; font-size: 13px; }
  .filter-row { margin-top: 16px; }
  .reset-button { border: 1px solid var(--border); background: var(--bg); color: var(--ink); border-radius: var(--radius); padding: 8px 12px; font: inherit; font-size: 12px; cursor: pointer; }
  .reset-button:disabled { opacity: .5; cursor: default; }
  .map-frame { position: relative; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 10px; isolation: isolate; }
  .campus-map { height: 390px; width: 100%; background: #e9eee7; }
  .map-loading { position: absolute; inset: 0; display: grid; place-items: center; color: var(--secondary); font-size: 13px; }
  .building-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
  .building-button { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; color: var(--ink); background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
  .building-button.selected { border-color: var(--green-accent); background: var(--green-tint-bg); color: var(--green-tint-text); }
  .building-count { font-size: 12px; font-weight: 600; }
  .unmapped { border-top: 1px solid var(--border); padding-top: 12px; font-size: 13px; }
  .unmapped summary { cursor: pointer; }
  .tile-notice { font-size: 12px; color: var(--secondary); margin: 10px 0; line-height: 1.5; }
  .tile-notice button { font: inherit; border: none; color: var(--green-accent); background: none; text-decoration: underline; cursor: pointer; }
  :global(.issue-pin) { background: none; border: none; }
  :global(.pin-count) { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: var(--green); border: 2px solid white; box-shadow: 0 2px 5px #0004; color: white; font: 600 13px system-ui, sans-serif; }
  :global(.pin-number) { transform: rotate(45deg); }
  :global(.leaflet-container) { font-family: inherit; }
  @media (max-width: 480px) {
    .campus-map { height: 340px; }
    .building-list { grid-template-columns: 1fr; }
  }
</style>
