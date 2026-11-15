// Temporary navigation only: no authentication, permissions, or credential storage.
// Replace this demo flow with the backend's authenticated role through $lib/api.ts.
export const DEMO_ROLES = ['Student', 'Technician', 'Admin'] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_DASHBOARDS = {
	Student: '/student',
	Technician: '/technician',
	Admin: '/admin'
} as const satisfies Record<DemoRole, string>;
