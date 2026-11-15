/** @type {Array<{ name: string, position: [number, number], osmWay: number }>} */
export const CAMPUS_BUILDINGS = [
  { name: 'Lupton Hall', position: [40.750924, -73.431257], osmWay: 470067577 },
  { name: 'Nold Hall', position: [40.748869, -73.431546], osmWay: 470067576 },
  { name: 'Roosevelt Hall', position: [40.750543, -73.429712], osmWay: 470065741 },
  { name: 'Gleeson Hall', position: [40.753014, -73.428614], osmWay: 470064987 }
];

/** @type {[[number, number], [number, number]]} */
export const CAMPUS_BOUNDS = [[40.7481, -73.433], [40.7542, -73.4266]];

export const CAMPUS_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const CAMPUS_TILE_OPTIONS = {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};
