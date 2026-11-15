import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildAdminTicketPatch as buildPatch } from '../src/lib/admin-tickets.ts';

const ticket = (patch = {}) => ({
	id: 'CF-admin-test',
	status: 'Open',
	technician: null,
	priority: null,
	...patch
});

test('assigning Delgado moves an open report into the technician queue', () => {
	assert.deepEqual(buildPatch(ticket(), { technician: 'J. Delgado', priority: 'High' }), {
		technician: 'J. Delgado',
		status: 'Assigned',
		priority: 'High'
	});
});

test('changing urgency preserves the existing technician and repair progress', () => {
	assert.deepEqual(
		buildPatch(ticket({ status: 'In progress', technician: 'M. Torres' }), { priority: 'Low' }),
		{ priority: 'Low' }
	);
});

test('reassigning an active repair preserves its progress', () => {
	assert.deepEqual(
		buildPatch(ticket({ status: 'In progress', technician: 'M. Torres' }), {
			technician: 'J. Delgado'
		}),
		{ technician: 'J. Delgado' }
	);
});

test('unassigning a queued ticket returns it to Open and allows clearing urgency', () => {
	assert.deepEqual(
		buildPatch(ticket({ status: 'Assigned', technician: 'J. Delgado', priority: 'High' }), {
			technician: null,
			priority: null
		}),
		{ technician: null, status: 'Open', priority: null }
	);
});

test('a repair in progress cannot lose its technician', () => {
	assert.throws(
		() =>
			buildPatch(ticket({ status: 'In progress', technician: 'J. Delgado' }), { technician: null }),
		/assign another technician/i
	);
});

test('finished tickets retain their assignment and history', () => {
	for (const status of ['Resolved', 'Closed']) {
		assert.throws(
			() => buildPatch(ticket({ status }), { technician: 'J. Delgado', priority: 'High' }),
			/finished/i
		);
	}
});

test('unknown technician names and unsupported urgency levels are rejected', () => {
	assert.throws(() => buildPatch(ticket(), { technician: 'Unknown technician' }), /technician/i);
	assert.throws(() => buildPatch(ticket(), { priority: 'Critical' }), /urgency/i);
});

test('unchanged selections do not generate a database update', () => {
	assert.deepEqual(
		buildPatch(ticket({ status: 'Assigned', technician: 'J. Delgado', priority: 'Medium' }), {
			technician: 'J. Delgado',
			priority: 'Medium'
		}),
		{}
	);
});
