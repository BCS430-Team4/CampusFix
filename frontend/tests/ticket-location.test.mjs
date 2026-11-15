import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { CampusFixAPI } from '../src/lib/api.ts';
import { CampusFixAPI as legacyAPI } from '../src/lib/api.js';

const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const previousFetch = globalThis.fetch;
const location = { latitude: 40.750924, longitude: -73.431257, isApproximate: true };
const input = { title: 'Broken walkway light', category: 'Electrical', building: '', room: '' };
let values;
let requests;
let responses;

function ticket(patch = {}) {
	return {
		id: 'CF-1043',
		title: input.title,
		category: input.category,
		building: 'Not specified',
		room: 'Not specified',
		description: '',
		status: 'Open',
		priority: null,
		technician: null,
		asset: null,
		created: 'Nov 14, 2026',
		updated: 'Nov 14, 2026',
		comments: [],
		...patch
	};
}

function respond(body, status = 200) {
	responses.push(
		new Response(status === 204 ? null : JSON.stringify(body), {
			status,
			headers: { 'Content-Type': 'application/json' }
		})
	);
}

beforeEach(() => {
	values = new Map();
	requests = [];
	responses = [];
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, String(value)),
			removeItem: (key) => values.delete(key)
		}
	});
	globalThis.fetch = async (url, options = {}) => {
		requests.push({
			url,
			method: options.method ?? 'GET',
			body: options.body ? JSON.parse(options.body) : undefined
		});
		assert.ok(responses.length, 'Unexpected extra backend request');
		return responses.shift();
	};
});

after(() => {
	globalThis.fetch = previousFetch;
	if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
	else delete globalThis.localStorage;
});

test('legacy imports use the same HTTP client and optional fields have backend defaults', async () => {
	assert.equal(legacyAPI, CampusFixAPI);
	respond(ticket(), 201);
	const saved = await CampusFixAPI.addTicket(input);
	assert.equal(saved.id, 'CF-1043');
	assert.equal(saved.location, null);
	assert.deepEqual(requests[0], {
		url: '/api/tickets',
		method: 'POST',
		body: {
			title: input.title,
			category: input.category,
			building: 'Not specified',
			room: 'Not specified',
			description: ''
		}
	});
});

test('server ticket is saved without coordinates and its pin survives later server reads locally', async () => {
	respond(ticket(), 201);
	const saved = await CampusFixAPI.addTicket({ ...input, location });
	assert.deepEqual(saved.location, location);
	assert.equal('location' in requests[0].body, false);
	assert.equal('latitude' in requests[0].body, false);
	respond(ticket());
	assert.deepEqual((await CampusFixAPI.getTicket(saved.id)).location, location);
	respond([ticket()]);
	assert.deepEqual((await CampusFixAPI.getTickets())[0].location, location);
	assert.ok(values.size > 0, 'The local estimate must be stored separately');
});

test('editing report text preserves its pin and a subsequent report does not inherit it', async () => {
	respond(ticket(), 201);
	await CampusFixAPI.addTicket({ ...input, location });
	respond(ticket({ title: 'Walkway light still broken' }));
	assert.deepEqual(
		(await CampusFixAPI.updateTicket('CF-1043', { title: 'Walkway light still broken' })).location,
		location
	);
	respond(ticket({ id: 'CF-1044' }), 201);
	assert.equal((await CampusFixAPI.addTicket(input)).location, null);
});

test('reused IDs with different server records do not inherit an old local pin', async () => {
	respond(ticket(), 201);
	await CampusFixAPI.addTicket({ ...input, location });
	respond(ticket({ title: 'A different report', building: 'Lupton Hall' }));
	assert.equal((await CampusFixAPI.getTicket('CF-1043')).location, null);
});

test('HTTP failures reject saves and lists instead of returning mock tickets', async () => {
	respond({ detail: 'Database unavailable' }, 500);
	await assert.rejects(CampusFixAPI.addTicket({ ...input, location }), /500/);
	assert.equal(values.size, 0);
	respond({}, 404);
	await assert.rejects(CampusFixAPI.getTickets(), /404/);
	respond({}, 404);
	assert.equal(await CampusFixAPI.getTicket('missing'), null);
});

test('deleting or resetting server tickets removes their local pin cache after success', async () => {
	respond(ticket(), 201);
	await CampusFixAPI.addTicket({ ...input, location });
	respond(null, 204);
	await CampusFixAPI.deleteTicket('CF-1043');
	respond(ticket());
	assert.equal((await CampusFixAPI.getTicket('CF-1043')).location, null);
	respond(ticket(), 201);
	await CampusFixAPI.addTicket({ ...input, location });
	respond({ message: 'Demo data reset' });
	await CampusFixAPI.resetMockData();
	respond(ticket());
	assert.equal((await CampusFixAPI.getTicket('CF-1043')).location, null);
});

test('PATCH sends supported fields only and clearing priority uses a backend-supported empty string', async () => {
	respond(ticket());
	await CampusFixAPI.updateTicket('CF-1043', {
		title: 'Edited',
		priority: null,
		location,
		completionNotes: 'Not a PATCH field',
		comments: []
	});
	assert.deepEqual(requests[0].body, { title: 'Edited', priority: '' });
});

test('technician comments use their endpoint and saved repair notes are available to history', async () => {
	const comment = {
		author: 'J. Delgado',
		role: 'Technician',
		when: 'Nov 14, 1:00 PM',
		body: 'Repair completed: Replaced the bulb'
	};
	respond(ticket({ status: 'Resolved', comments: [comment] }), 201);
	const result = await CampusFixAPI.addComment(
		'CF-1043',
		comment.body,
		comment.author,
		comment.role
	);
	assert.deepEqual(requests[0], {
		url: '/api/tickets/CF-1043/comments',
		method: 'POST',
		body: { body: comment.body, author: comment.author, role: comment.role }
	});
	assert.equal(result.completionNotes, 'Replaced the bulb');
	assert.equal(result.completedAt, undefined, 'Do not invent a server completion timestamp');
});
