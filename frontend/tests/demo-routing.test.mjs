import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_DASHBOARDS, DEMO_ROLES, demoRedirect } from '../src/lib/demo-access.ts';

const workspaces = {
	Student: ['/student', '/my-tickets', '/map', '/report', '/profile', '/tickets/[id]'],
	Technician: [
		'/technician',
		'/technician/map',
		'/technician/assigned',
		'/technician/completed',
		'/technician/profile',
		'/technician/tickets/[id]'
	],
	Admin: [
		'/admin',
		'/admin/assigned',
		'/admin/completed',
		'/admin/profile',
		'/admin/create-ticket',
		'/admin/technicians',
		'/admin/tickets/[id]'
	]
};

for (const owner of DEMO_ROLES) {
	test(`${owner} screens require the matching demo role`, () => {
		for (const route of workspaces[owner]) {
			assert.equal(demoRedirect(route, null), '/login');
			for (const role of DEMO_ROLES) {
				assert.equal(demoRedirect(route, role), role === owner ? null : DEMO_DASHBOARDS[role]);
			}
		}
	});
}

test('public role selection is available after logout and returns active sessions home', () => {
	for (const route of ['/login', '/signup']) {
		assert.equal(demoRedirect(route, null), null);
		for (const role of DEMO_ROLES) assert.equal(demoRedirect(route, role), DEMO_DASHBOARDS[role]);
	}
	assert.equal(demoRedirect('/request-access', null), null);
});
