<script>
  let { name, size = 22 } = $props();
  const paths = {
    monitor: ['M4 3h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z', 'M12 16v5M8 21h8'],
    bolt: ['m13 2-9 12h7l-1 8 10-13h-7l1-7Z'],
    droplet: ['M12 3c-2 3-7 7-7 11a7 7 0 0 0 14 0c0-4-5-8-7-11Z', 'M8 14a4 4 0 0 0 4 4'],
    fan: ['M10 10C6 9 5 6 7 4c3-3 7-1 6 6', 'M14 10c3-3 7-2 7 1 0 4-4 6-7 3', 'M12 14c1 4-1 7-4 6-4-1-4-5 2-7'],
    chair: ['M6 12V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8', 'M5 12h14v5H5v-5Z', 'M6 17v4M18 17v4M3 10v5h2M21 10v5h-2'],
    broom: ['m16 3-6 10', 'm8 12 6 3-3 6H3l5-9Z', 'm8 16-2 5M11 17l-2 4'],
    shield: ['m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z', 'm8 12 3 3 5-6'],
    camera: ['M8 6 10 3h4l2 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4Z'],
    lock: ['M7 10V7a5 5 0 0 1 10 0v3', 'M5 10h14v11H5V10Z', 'M12 14v3']
  };
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  {#each paths[name] || [] as d}<path {d} />{/each}
  {#if name === 'more'}
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  {:else if name === 'camera'}
    <circle cx="12" cy="13" r="4" />
  {:else if name === 'fan'}
    <circle cx="12" cy="12" r="2" />
  {/if}
</svg>

<style>
  svg { display: block; flex-shrink: 0; }
</style>
