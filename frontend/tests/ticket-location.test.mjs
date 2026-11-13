import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { CampusFixAPI } from '../src/lib/api.js';

const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const input = {
	title: 'Broken walkway light',
	category: 'Electrical',
	building: '',
	room: 'Near the walkway'
};
const location = { latitude: 40.750924, longitude: -73.431257, isApproximate: true };

beforeEach(() => {
	const values = new Map();
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, String(value))
		}
	});
});

after(() => {
	if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
	else delete globalThis.localStorage;
});

test('a report can be saved without an optional pin', () => {
	const ticket = CampusFixAPI.addTicket(input);
	assert.equal(ticket.location, null);
	assert.equal(CampusFixAPI.getTicket(ticket.id).location, null);
});

test('confirmed coordinates and approximate flag survive a storage round trip', () => {
	const ticket = CampusFixAPI.addTicket({ ...input, location });
	assert.deepEqual(CampusFixAPI.getTicket(ticket.id).location, location);
	const stored = JSON.parse(localStorage.getItem('campusfix_mock_tickets_v1'));
	assert.deepEqual(stored.find((item) => item.id === ticket.id).location, location);
});

test('editing report text preserves its pin and a later report does not inherit it', () => {
	const first = CampusFixAPI.addTicket({ ...input, location });
	CampusFixAPI.updateTicket(first.id, { title: 'Walkway light is still broken' });
	const second = CampusFixAPI.addTicket({ ...input, location: null });
	assert.deepEqual(CampusFixAPI.getTicket(first.id).location, location);
	assert.equal(CampusFixAPI.getTicket(second.id).location, null);
});

test('existing tickets without coordinates remain available', () => {
	assert.equal(CampusFixAPI.getTicket('CF-1042').title, 'Flickering lights in lab');
	CampusFixAPI.addTicket({ ...input, location });
	assert.equal(CampusFixAPI.getTicket('CF-1042').title, 'Flickering lights in lab');
});
