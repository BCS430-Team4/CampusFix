import { formatToday } from './shared.js';

// Mock storage; replace with backend requests when the API is ready.
const STORAGE_KEY = 'campusfix_mock_tickets_v1';

const SEED_TICKETS = [
  { id: 'CF-1042', title: 'Flickering lights in lab', category: 'Electrical', building: 'Lupton Hall', room: 'Room 204',
    description: 'The overhead lights near the back row flicker on and off every few minutes during class.',
    status: 'Open', priority: null, technician: null, asset: null, created: 'Sep 16, 2026', updated: 'Sep 16, 2026', comments: [] },
  { id: 'CF-1038', title: "Projector won't turn on", category: 'IT / Tech', building: 'Nold Hall', room: 'Room 118',
    description: "The ceiling projector doesn't respond to the remote or the wall panel.",
    status: 'Assigned', priority: 'Low', technician: 'J. Delgado', asset: 'Projector — Nold 118', created: 'Sep 14, 2026', updated: 'Sep 15, 2026', comments: [] },
  { id: 'CF-1029', title: 'Leaking sink', category: 'Plumbing', building: 'Roosevelt Hall', room: 'Room 3B',
    description: 'Water is pooling under the sink in the second-floor bathroom. Getting worse over the past two days — floor near the door is wet by midday.',
    status: 'In progress', priority: 'Medium', technician: 'M. Torres', asset: 'Sink Unit — Roosevelt 3B', created: 'Sep 9, 2026', updated: 'Sep 13, 2026',
    comments: [
      { author: 'M. Torres', role: 'Technician', when: 'Sep 12, 3:40 PM', body: 'Heading over this afternoon — can you confirm the bathroom is unlocked during that time?' },
      { author: 'Aneudys Garcia', role: 'You', when: 'Sep 12, 4:02 PM', body: "Yes, it's open until 8pm on weekdays." },
      { author: 'M. Torres', role: 'Technician', when: 'Sep 13, 10:15 AM', body: 'Found the source — replacing a worn pipe fitting. Should be done by end of day.' }
    ] },
  { id: 'CF-0991', title: 'Jammed door, west entrance', category: 'Furniture', building: 'Gleeson Hall', room: 'Lobby',
    description: 'The west entrance door sticks and needs a hard shove to close.',
    status: 'Closed', priority: 'Low', technician: 'M. Torres', asset: null, created: 'Sep 6, 2026', updated: 'Sep 9, 2026', comments: [] },
  { id: 'CF-0977', title: 'No wifi in study room', category: 'IT / Tech', building: 'Colleran Hall', room: 'Room 2C',
    description: 'Wifi signal drops constantly in the group study room.',
    status: 'Resolved', priority: 'Medium', technician: 'J. Delgado', asset: 'Access Point — Colleran 2C', created: 'Sep 1, 2026', updated: 'Sep 4, 2026', comments: [] }
];

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {  }
  saveAll(SEED_TICKETS);
  return JSON.parse(JSON.stringify(SEED_TICKETS));
}

function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const CampusFixAPI = {

  getTickets() {
    return loadAll();
  },

  getTicket(id) {
    return loadAll().find(t => t.id === id) || null;
  },

  addTicket(data) {
    const list = loadAll();
    const nums = list.map(t => parseInt(String(t.id).replace('CF-', ''), 10)).filter(n => !isNaN(n));
    const nextNum = (nums.length ? Math.max(...nums) : 1042) + 1;
    const today = formatToday();
    const ticket = {
      id: 'CF-' + nextNum,
      title: data.title,
      category: data.category,
      building: data.building || 'Not specified',
      room: data.room || 'Not specified',
      description: data.description || '',
      status: 'Open',
      priority: null,
      technician: null,
      asset: null,
      created: today,
      updated: today,
      comments: []
    };
    list.unshift(ticket);
    saveAll(list);
    return ticket;
  },

  updateTicket(id, patch) {
    const list = loadAll();
    const t = list.find(x => x.id === id);
    if (!t) return null;
    Object.assign(t, patch, { updated: formatToday() });
    saveAll(list);
    return t;
  },

  addComment(id, body) {
    const list = loadAll();
    const t = list.find(x => x.id === id);
    if (!t) return null;
    t.comments.push({ author: 'Aneudys Garcia', role: 'You', when: 'Just now', body });
    t.updated = formatToday();
    saveAll(list);
    return t;
  },
  resetMockData() {
    saveAll(SEED_TICKETS);
  }
};


