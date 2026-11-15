/** A student-selected estimate, not a measured GPS position. */
export interface TicketLocation {
	latitude: number;
	longitude: number;
	isApproximate: true;
}

export interface CreateTicketInput {
	title: string;
	category: string;
	description?: string;
	building?: string;
	room?: string;
	location?: TicketLocation | null;
}
