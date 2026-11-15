import type { Ticket, UpdateTicketPatch } from './api';

/** Demo choices until the backend exposes a technician directory. */
export const DEMO_TECHNICIANS: readonly string[] = ['J. Delgado'];
export const TICKET_URGENCY_LEVELS: readonly string[] = ['Low', 'Medium', 'High'];
export type AdminTicketChanges = Pick<UpdateTicketPatch, 'technician' | 'priority'>;

export function buildAdminTicketPatch(
	ticket: Pick<Ticket, 'status' | 'technician' | 'priority'>,
	changes: AdminTicketChanges
): UpdateTicketPatch {
	if (['Resolved', 'Closed'].includes(ticket.status)) {
		throw new Error('This ticket is already finished. Reload to see its repair history.');
	}

	const patch: UpdateTicketPatch = {};
	if (changes.technician !== undefined) {
		const technician = changes.technician?.trim() || null;
		if (technician && technician !== ticket.technician && !DEMO_TECHNICIANS.includes(technician)) {
			throw new Error('Choose an available technician.');
		}
		if (technician !== ticket.technician) {
			if (!technician && ticket.status === 'In progress') {
				throw new Error(
					'This repair is in progress. Assign another technician instead of unassigning it.'
				);
			}
			patch.technician = technician;
			if (technician && ticket.status === 'Open') patch.status = 'Assigned';
			if (!technician && ticket.status === 'Assigned') patch.status = 'Open';
		}
	}
	if (changes.priority !== undefined) {
		const priority = changes.priority || null;
		if (priority && !TICKET_URGENCY_LEVELS.includes(priority)) {
			throw new Error('Choose Low, Medium, High, or no urgency.');
		}
		if (priority !== ticket.priority) patch.priority = priority;
	}
	return patch;
}
