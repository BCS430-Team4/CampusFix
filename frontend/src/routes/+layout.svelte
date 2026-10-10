<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/Button.svelte'

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Button/>

{@render children()}
