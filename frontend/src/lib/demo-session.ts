import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { DEMO_DASHBOARDS, DEMO_ROLES, type DemoRole } from './demo-access';

const sessionKey = 'campusfix_demo_role';
let memoryRole: DemoRole | null = null;

export function readDemoRole(): DemoRole | null {
	try {
		const stored = sessionStorage.getItem(sessionKey);
		return DEMO_ROLES.find((role) => role === stored) ?? null;
	} catch {
		return memoryRole;
	}
}

export function enterDemoRole(role: DemoRole | null) {
	memoryRole = role;
	try {
		if (role) sessionStorage.setItem(sessionKey, role);
		else sessionStorage.removeItem(sessionKey);
	} catch {
		// The current page can still navigate if browser storage is unavailable.
	}
	return goto(resolve(role ? DEMO_DASHBOARDS[role] : '/login'), {
		replaceState: true,
		invalidateAll: true
	});
}
