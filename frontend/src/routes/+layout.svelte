<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { readDemoRole } from '$lib/demo-session';
	import { workspaceRole } from '$lib/demo-access';
	import { resolve } from '$app/paths';
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
	] as const;
	let secondary = $derived(
		page.url.pathname === '/report' || page.url.pathname.startsWith('/tickets/')
	);
	let studentView = $derived(
		workspaceRole(page.route.id) === 'Student' && page.data.role === 'Student'
	);

	function notify(text: string) {
		message = text;
		clearTimeout(timer);
		timer = setTimeout(() => (message = ''), 2400);
	}

	setContext('notify', notify);

	onMount(() => {
		function restoreSession(event: PageTransitionEvent) {
			if (event.persisted && readDemoRole() !== page.data.role) void invalidateAll();
		}
		window.addEventListener('pageshow', restoreSession);
		return () => {
			window.removeEventListener('pageshow', restoreSession);
			clearTimeout(timer);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !studentView}
	{@render children()}
{:else}
	<div class="app student-app">
		{#if !secondary}
			<Topbar />
			<nav class="tabbar" aria-label="Student navigation">
				{#each tabs as [href, label] (href)}
					<a
						class="tab"
						class:active={page.url.pathname === href}
						aria-current={page.url.pathname === href ? 'page' : undefined}
						href={resolve(href)}>{label}</a
					>
				{/each}
			</nav>
		{/if}
		{@render children()}
	</div>
{/if}

<div class="toast" class:show={message !== ''} role="status" aria-live="polite">{message}</div>
