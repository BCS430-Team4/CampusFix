import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	// Let the existing layout translate old /#/dashboard and /#/ticket bookmarks.
	// SvelteKit does not expose fragments through a load function's URL.
	if (browser && window.location.hash.startsWith('#/')) return {};
	redirect(307, resolve('/signup'));
};
