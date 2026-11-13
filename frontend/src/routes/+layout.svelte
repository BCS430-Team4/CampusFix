<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Topbar from '$lib/components/Topbar.svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
	let message = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;
	const tabs = [
		['/student', 'Dashboard'],
		['/my-tickets', 'My tickets'],
		['/map', 'Map']
	];
	let secondary = $derived(
		page.url.pathname === '/report' || page.url.pathname.startsWith('/tickets/')
	);
	let staffView = $derived(
		['/admin', '/technician'].some(
			(path) => page.url.pathname === path || page.url.pathname.startsWith(path + '/')
		)
	);
	let isAuthPage = $derived(
		['/', '/login', '/signup', '/request-access'].includes(page.url.pathname)
	);

	function notify(text: string) {
		message = text;
		clearTimeout(timer);
		timer = setTimeout(() => (message = ''), 2400);
	}

	setContext('notify', notify);

	onMount(() => {
		const hash = location.hash.slice(1);
		if (hash.startsWith('/')) {
			const [path, query = ''] = hash.split('?');
			const params = new URLSearchParams(query);
			const routes: Record<string, string> = {
				'/dashboard': '/student',
				'/my-tickets': '/my-tickets',
				'/report': '/report',
				'/profile': '/profile',
				'/map': '/map'
			};
			const ticketId = params.get('id');
			if (path === '/ticket' && ticketId) {
				goto('/tickets/' + encodeURIComponent(ticketId), { replaceState: true });
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

{#if staffView || isAuthPage}
	{@render children()}
{:else}
	<div class="app student-app">
		{#if !secondary}
			<Topbar />
			<nav class="tabbar" aria-label="Student navigation">
				{#each tabs as [href, label]}
					<a
						class="tab"
						class:active={page.url.pathname === href}
						aria-current={page.url.pathname === href ? 'page' : undefined}
						{href}>{label}</a
					>
				{/each}
			</nav>
		{/if}
		{@render children()}
	</div>
{/if}

<div class="toast" class:show={message !== ''} role="status" aria-live="polite">{message}</div>
