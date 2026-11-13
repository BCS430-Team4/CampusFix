<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/Button.svelte'
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
  let isAuthPage = $derived(
    page.url.pathname === '/login' || page.url.pathname === '/signup'
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

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !isAuthPage}
<Button />
{/if}

{@render children()}

<style>
  :global(.app.technician-app) {
    max-width: 1000px;
  }
</style>