import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { demoRedirect } from '$lib/demo-access';
import { readDemoRole } from '$lib/demo-session';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = ({ route }) => {
	const role = readDemoRole();
	const destination = demoRedirect(route.id, role);
	if (destination) redirect(307, resolve(destination));
	return { role };
};
