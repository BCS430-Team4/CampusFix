export const CATEGORIES = [
  { label: 'IT / Tech', icon: 'monitor' },
  { label: 'Electrical', icon: 'bolt' },
  { label: 'Plumbing', icon: 'droplet' },
  { label: 'HVAC', icon: 'fan' },
  { label: 'Furniture', icon: 'chair' },
  { label: 'Cleaning', icon: 'broom' },
  { label: 'Safety', icon: 'shield' },
  { label: 'Other', icon: 'more' }
];

export const BUILDINGS = ['Lupton Hall', 'Nold Hall', 'Roosevelt Hall', 'Gleeson Hall', 'Colleran Hall'];

export const STATUS_COLOR = {
  'Open': ['var(--warning)', 'var(--warning-bg)'],
  'Assigned': ['var(--accent)', 'var(--accent-bg)'],
  'In progress': ['var(--success)', 'var(--success-bg)'],
  'Resolved': ['var(--muted)', 'var(--bg-alt)'],
  'Closed': ['var(--muted)', 'var(--bg-alt)']
};

export function formatToday() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning, Aneudys';
  if (h < 18) return 'Good afternoon, Aneudys';
  return 'Good evening, Aneudys';
}



