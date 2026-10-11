<script>
  import { onMount, setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Topbar from '$lib/components/Topbar.svelte';
  import '../app.css';

  let { children } = $props();
  let message = $state('');
  let timer;
  const tabs = [['/', 'Dashboard'], ['/my-tickets', 'My tickets'], ['/map', 'Map']];
  let secondary = $derived(page.url.pathname === '/report' || page.url.pathname.startsWith('/tickets/'));
  let technicianView = $derived(
    page.url.pathname === '/technician' ||
    page.url.pathname.startsWith('/technician/')
  ); 

  function notify(text) {
    message = text;
    clearTimeout(timer);
    timer = setTimeout(() => message = '', 2400);
  }

  setContext('notify', notify);

  onMount(() => {
    const hash = location.hash.slice(1);
    if (hash.startsWith('/')) {
      const [path, query = ''] = hash.split('?');
      const params = new URLSearchParams(query);
      const routes = { '/dashboard': '/', '/my-tickets': '/my-tickets', '/report': '/report', '/profile': '/profile', '/map': '/map' };
      if (path === '/ticket' && params.has('id')) {
        goto('/tickets/' + encodeURIComponent(params.get('id')), { replaceState: true });
      } else if (routes[path]) {
        goto(routes[path], { replaceState: true });
      }
    }
    return () => clearTimeout(timer);
  });
</script>

<svelte:head><title>CampusFix</title></svelte:head>
<div class="app" class:technician-app={technicianView}>
  {#if !secondary && !technicianView}
    <Topbar />
    <nav class="tabbar" aria-label="Main navigation">
      {#each tabs as [href, label]}
        <a class="tab" class:active={page.url.pathname === href} aria-current={page.url.pathname === href ? 'page' : undefined} {href}>{label}</a>
      {/each}
    </nav>
  {/if}
  {#key page.url.pathname + page.url.search}
    {@render children()}
  {/key}
</div>
<div class="toast" class:show={Boolean(message)} role="status">{message}</div>

<style>
  :global(.app.technician-app) {
    max-width: 1000px;
  }
</style>