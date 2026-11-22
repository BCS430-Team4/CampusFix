<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { DEMO_DASHBOARDS } from '$lib/demo-access';
	import { readDemoRole } from '$lib/demo-session';
	const role = $derived(page.data.role ?? readDemoRole());
</script>

<main class="content">
	<div class="empty-state">
		{page.status}: {page.error?.message || 'Something went wrong.'}
		<a href={resolve(role ? DEMO_DASHBOARDS[role] : '/login')}
			>{role ? 'Go to dashboard' : 'Log in'}</a
		>
	</div>
</main>
