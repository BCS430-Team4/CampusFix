export interface TicketComment {
  id: number;
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
  status: 'Open' | 'Assigned' | 'In progress' | 'Resolved' | 'Closed' | string;
  priority: 'Low' | 'Medium' | 'High' | string | null;
  technician: string | null;
  asset: string | null;
  created: string;
  updated: string;
  comments: TicketComment[];
}

export interface CreateTicketInput {
  title: string;
  category: string;
  building?: string;
  room?: string;
  description?: string;
}

export type UpdateTicketPatch = Partial<
    Omit<Ticket, 'id' | 'created' | 'updated' | 'comments'>
>;

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

function buildRoute(template: string, params: Record<string, string | number> = {}): string {
  return Object.entries(params).reduce(
      (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
      template
  );
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null as T;
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const CampusFixAPI = {
  getTickets(): Promise<Ticket[]> {
    return apiFetch<Ticket[]>(TICKETS_ROUTE);
  },

  getTicket(id: string): Promise<Ticket | null> {
    return apiFetch<Ticket | null>(buildRoute(TICKET_BY_ID_ROUTE, { id }));
  },

  addTicket(data: CreateTicketInput): Promise<Ticket> {
    return apiFetch<Ticket>(TICKETS_ROUTE, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        category: data.category,
        building: data.building || 'Not specified',
        room: data.room || 'Not specified',
        description: data.description || ''
      })
    });
  },

  updateTicket(id: string, patch: UpdateTicketPatch): Promise<Ticket | null> {
    return apiFetch<Ticket | null>(buildRoute(TICKET_BY_ID_ROUTE, { id }), {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  },

  deleteTicket(id: string): Promise<void> {
    return apiFetch<void>(buildRoute(TICKET_BY_ID_ROUTE, { id }), {
      method: 'DELETE'
    });
  },

  getComments(ticketId: string): Promise<TicketComment[] | null> {
    return apiFetch<TicketComment[] | null>(buildRoute(TICKET_COMMENTS_ROUTE, { ticketId }));
  },

  addComment(
      ticketId: string,
      body: string,
      author = 'Aneudys Garcia',
      role = 'You'
  ): Promise<Ticket | null> {
    return apiFetch<Ticket | null>(buildRoute(TICKET_COMMENTS_ROUTE, { ticketId }), {
      method: 'POST',
      body: JSON.stringify({ body, author, role })
    });
  },

  updateComment(
      ticketId: string,
      commentId: number,
      body: string
  ): Promise<TicketComment | null> {
    return apiFetch<TicketComment | null>(
        buildRoute(TICKET_COMMENT_BY_ID_ROUTE, { ticketId, commentId }),
            {
              method: 'PATCH',
              body: JSON.stringify({ body })
            }
    );
  },

  deleteComment(ticketId: string, commentId: number): Promise<void> {
    return apiFetch<void>(
        buildRoute(TICKET_COMMENT_BY_ID_ROUTE, { ticketId, commentId }),
            {
              method: 'DELETE'
            }
    );
  },

  resetMockData(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(TICKET_RESET_ROUTE, {
      method: 'POST'
    });
  }
};
