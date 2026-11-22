import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { resolve } from '$app/paths';
import { DEMO_DASHBOARDS } from '$lib/demo-access';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { role } = await parent();
	const hash = browser ? window.location.hash : '';
	if (!role) redirect(307, resolve(hash.startsWith('#/') ? '/login' : '/signup'));

	if (hash.startsWith('#/')) {
		const [path, query] = hash.slice(1).split('?');
		const id = new URLSearchParams(query).get('id');
		if (path === '/ticket' && id) {
			const ticketRoutes = {
				Admin: '/admin/tickets/[id]',
				Technician: '/technician/tickets/[id]',
				Student: '/tickets/[id]'
			} as const;
			redirect(307, resolve(ticketRoutes[role], { id }));
		}
		const bookmarks = {
			'/my-tickets': {
				Admin: '/admin/assigned',
				Technician: '/technician/assigned',
				Student: '/my-tickets'
			},
			'/profile': {
				Admin: '/admin/profile',
				Technician: '/technician/profile',
				Student: '/profile'
			},
			'/map': { Admin: '/admin', Technician: '/technician/map', Student: '/map' },
			'/report': { Admin: '/admin/create-ticket', Technician: '/technician', Student: '/report' }
		} as const;
		if (Object.hasOwn(bookmarks, path))
			redirect(307, resolve(bookmarks[path as keyof typeof bookmarks][role]));
	}
	redirect(307, resolve(DEMO_DASHBOARDS[role]));
};
