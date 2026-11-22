// Temporary navigation only: no authentication, permissions, or credential storage.
// Replace this demo flow with the backend's authenticated role through $lib/api.ts.
export const DEMO_ROLES = ['Student', 'Technician', 'Admin'] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_DASHBOARDS = {
	Student: '/student',
	Technician: '/technician',
	Admin: '/admin'
} as const satisfies Record<DemoRole, string>;

export function workspaceRole(routeId: string | null): DemoRole | null {
	if (!routeId || ['/', '/login', '/signup', '/request-access'].includes(routeId)) return null;
	const section = routeId.split('/')[1];
	if (section === 'admin') return 'Admin';
	if (section === 'technician') return 'Technician';
	// Student pages use top-level routes such as /map, /report and /tickets/[id].
	return 'Student';
}

export function demoRedirect(routeId: string | null, role: DemoRole | null) {
	const required = workspaceRole(routeId);
	if (required && required !== role) return role ? DEMO_DASHBOARDS[role] : '/login';
	if (role && (routeId === '/login' || routeId === '/signup')) return DEMO_DASHBOARDS[role];
	return null;
}
