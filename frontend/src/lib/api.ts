import type { CreateTicketInput, TicketLocation } from './types/ticket-location';
export type { CreateTicketInput, TicketLocation } from './types/ticket-location';

export interface TicketComment {
	id?: number;
	author: string;
	role: string;
	when: string;
	body: string;
}

export interface Ticket {
	id: string;
	title: string;
	category: string;
	building: string;
	room: string;
	description: string;
	status: string;
	priority: string | null;
	technician: string | null;
	asset: string | null;
	created: string;
	updated: string;
	comments: TicketComment[];
	/** Browser-only estimate until the backend supports coordinates. */
	location: TicketLocation | null;
	/** Derived from technician comments, not a separate database field. */
	completionNotes?: string;
	completedAt?: string;
}

type ServerTicket = Omit<Ticket, 'location' | 'completionNotes'>;
const updateFields = [
	'title',
	'category',
	'building',
	'room',
	'description',
	'status',
	'priority',
	'technician',
	'asset'
] as const;
export type UpdateTicketPatch = Partial<Pick<Ticket, (typeof updateFields)[number]>>;

export const TICKETS_ROUTE = '/api/tickets' as const;
export const TICKET_BY_ID_ROUTE = '/api/tickets/:id' as const;
export const TICKET_RESET_ROUTE = '/api/tickets/reset' as const;
export const TICKET_COMMENTS_ROUTE = '/api/tickets/:ticketId/comments' as const;
export const TICKET_COMMENT_BY_ID_ROUTE = '/api/tickets/:ticketId/comments/:commentId' as const;
export const API_ROUTES = {
	TICKETS: TICKETS_ROUTE,
	TICKET_BY_ID: TICKET_BY_ID_ROUTE,
	TICKET_RESET: TICKET_RESET_ROUTE,
	TICKET_COMMENTS: TICKET_COMMENTS_ROUTE,
	TICKET_COMMENT_BY_ID: TICKET_COMMENT_BY_ID_ROUTE
} as const;

const PIN_KEY = 'campusfix_local_ticket_pins_v1';
const identityFields = ['created', 'title', 'category', 'building', 'room'] as const;
type PinIdentity = Pick<Ticket, (typeof identityFields)[number]>;
interface LocalPin {
	identity: PinIdentity;
	location: TicketLocation;
}
type PinStore = Record<string, LocalPin>;

function readPins(): PinStore {
	try {
		const value: unknown = JSON.parse(localStorage.getItem(PIN_KEY) ?? '{}');
		return value && typeof value === 'object' && !Array.isArray(value) ? (value as PinStore) : {};
	} catch {
		return {};
	}
}

function writePins(pins: PinStore): boolean {
	try {
		localStorage.setItem(PIN_KEY, JSON.stringify(pins));
		return true;
	} catch {
		return false;
	}
}

function pinIdentity(ticket: ServerTicket): PinIdentity {
	return {
		created: ticket.created,
		title: ticket.title,
		category: ticket.category,
		building: ticket.building,
		room: ticket.room
	};
}

function sameIdentity(pin: LocalPin, ticket: ServerTicket, patch: UpdateTicketPatch = {}): boolean {
	return (
		!!pin.identity &&
		identityFields.every(
			(field) =>
				(field !== 'created' && Object.hasOwn(patch, field)) ||
				pin.identity[field] === ticket[field]
		)
	);
}

function validLocation(point: TicketLocation): boolean {
	return (
		!!point &&
		Number.isFinite(point.latitude) &&
		Math.abs(point.latitude) <= 90 &&
		Number.isFinite(point.longitude) &&
		Math.abs(point.longitude) <= 180 &&
		point.isApproximate === true
	);
}

function removePin(id: string) {
	const pins = readPins();
	if (Object.hasOwn(pins, id)) {
		delete pins[id];
		writePins(pins);
	}
}

function decorate(ticket: ServerTicket): Ticket {
	const pins = readPins();
	const pin = pins[ticket.id];
	let location: TicketLocation | null = null;
	if (pin && sameIdentity(pin, ticket) && validLocation(pin.location))
		location = { ...pin.location };
	else if (pin) removePin(ticket.id);
	const notes = [...ticket.comments]
		.reverse()
		.find(
			(comment) => comment.role === 'Technician' && comment.body.startsWith('Repair completed: ')
		);
	return {
		...ticket,
		priority: ticket.priority || null,
		technician: ticket.technician || null,
		asset: ticket.asset || null,
		location,
		...(notes ? { completionNotes: notes.body.slice('Repair completed: '.length) } : {})
	};
}

function buildRoute(template: string, params: Record<string, string | number> = {}): string {
	return Object.entries(params).reduce(
		(path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
		template
	);
}

async function apiFetch<T>(
	url: string,
	options: RequestInit = {},
	allowMissing = false
): Promise<T> {
	const headers = new Headers(options.headers);
	if (options.body !== undefined) headers.set('Content-Type', 'application/json');
	const response = await fetch(url, { ...options, headers });
	if (response.status === 404 && allowMissing) return null as T;
	if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}

export const CampusFixAPI = {
	async getTickets(): Promise<Ticket[]> {
		const tickets = await apiFetch<ServerTicket[]>(TICKETS_ROUTE);
		if (!Array.isArray(tickets)) throw new Error('Invalid ticket response');
		return tickets.map(decorate);
	},
	async getTicket(id: string): Promise<Ticket | null> {
		const ticket = await apiFetch<ServerTicket | null>(
			buildRoute(TICKET_BY_ID_ROUTE, { id }),
			{},
			true
		);
		if (!ticket) {
			removePin(id);
			return null;
		}
		return decorate(ticket);
	},
	async addTicket(data: CreateTicketInput): Promise<Ticket> {
		const ticket = await apiFetch<ServerTicket>(TICKETS_ROUTE, {
			method: 'POST',
			body: JSON.stringify({
				title: data.title,
				category: data.category,
				building: data.building || 'Not specified',
				room: data.room || 'Not specified',
				description: data.description || ''
			})
		});
		if (data.location && validLocation(data.location)) {
			const pins = readPins();
			pins[ticket.id] = { identity: pinIdentity(ticket), location: { ...data.location } };
			writePins(pins);
		}
		return decorate(ticket);
	},
	async updateTicket(id: string, patch: UpdateTicketPatch): Promise<Ticket | null> {
		const body: Record<string, string> = {};
		for (const field of updateFields) {
			// This backend ignores null PATCH values; empty strings clear optional text.
			if (patch[field] !== undefined) body[field] = patch[field] ?? '';
		}
		const ticket = await apiFetch<ServerTicket | null>(
			buildRoute(TICKET_BY_ID_ROUTE, { id }),
			{
				method: 'PATCH',
				body: JSON.stringify(body)
			},
			true
		);
		if (!ticket) return null;
		const pins = readPins();
		const pin = pins[id];
		if (pin && sameIdentity(pin, ticket, patch)) {
			pins[id] = { ...pin, identity: pinIdentity(ticket) };
			writePins(pins);
		}
		return decorate(ticket);
	},
	async deleteTicket(id: string): Promise<void> {
		await apiFetch<void>(buildRoute(TICKET_BY_ID_ROUTE, { id }), { method: 'DELETE' });
		removePin(id);
	},
	getComments(ticketId: string): Promise<TicketComment[] | null> {
		return apiFetch(buildRoute(TICKET_COMMENTS_ROUTE, { ticketId }), {}, true);
	},
	async addComment(
		ticketId: string,
		body: string,
		author = 'Aneudys Garcia',
		role = 'You'
	): Promise<Ticket | null> {
		const ticket = await apiFetch<ServerTicket | null>(
			buildRoute(TICKET_COMMENTS_ROUTE, { ticketId }),
			{
				method: 'POST',
				body: JSON.stringify({ body, author, role })
			},
			true
		);
		return ticket ? decorate(ticket) : null;
	},
	updateComment(ticketId: string, commentId: number, body: string): Promise<TicketComment | null> {
		return apiFetch(
			buildRoute(TICKET_COMMENT_BY_ID_ROUTE, { ticketId, commentId }),
			{
				method: 'PATCH',
				body: JSON.stringify({ body })
			},
			true
		);
	},
	deleteComment(ticketId: string, commentId: number): Promise<void> {
		return apiFetch(buildRoute(TICKET_COMMENT_BY_ID_ROUTE, { ticketId, commentId }), {
			method: 'DELETE'
		});
	},
	async resetMockData(): Promise<{ message: string }> {
		const result = await apiFetch<{ message: string }>(TICKET_RESET_ROUTE, { method: 'POST' });
		try {
			localStorage.removeItem(PIN_KEY);
		} catch {
			/* Storage can be unavailable. */
		}
		return result;
	}
};
