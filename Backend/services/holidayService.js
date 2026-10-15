const CALENDARIFIC_API = 'https://calendarific.com/api/v2/holidays';

// Simple in-memory cache — refreshes once per day
let cache = { year: null, data: null, fetchedAt: null };

export async function getHolidays(country = 'IN', year = new Date().getFullYear()) {
  const apiKey = process.env.CALENDARIFIC_API_KEY;

  if (!apiKey) {
    console.warn('CALENDARIFIC_API_KEY not set, skipping holiday fetch.');
    return null;
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Return cache if same year and fetched within 24 hours
  if (cache.year === year && cache.data && (now - cache.fetchedAt) < oneDay) {
    return cache.data;
  }

  try {
    const url = `${CALENDARIFIC_API}?api_key=${apiKey}&country=${country}&year=${year}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.meta?.code !== 200 || !json.response?.holidays) {
      console.error('Calendarific error:', json.meta);
      return null;
    }

    const GAZETTED_TYPES = ['Gazetted Holiday', 'National holiday', 'Public Holiday'];

    const holidays = json.response.holidays
      .filter(h => GAZETTED_TYPES.includes(h.primary_type))
      .map((h, i) => ({
        id: `HOL-${year}-${String(i + 1).padStart(3, '0')}`,
        name: h.name,
        date: h.date.iso.split('T')[0],
        type: 'National',
        description: h.description || '',
      }));

    cache = { year, data: holidays, fetchedAt: now };
    console.log(`Fetched ${holidays.length} holidays from Calendarific for ${country} ${year}`);
    return holidays;
  } catch (err) {
    console.error('Failed to fetch holidays from Calendarific:', err.message);
    return null;
  }
}

// Company-declared holidays that Calendarific doesn't (or only partly) cover.
// Merged over the live list in withCustomHolidays — a custom entry wins when
// both fall on the same date.
const CUSTOM_HOLIDAYS = [
  { name: 'Maha Ashtami', date: '2026-10-19' },
  { name: 'Dussehra', date: '2026-10-20' },
  { name: 'Maharishi Valmiki Jayanti', date: '2026-10-26' },
  { name: 'Dhanteras', date: '2026-11-06' },
  { name: 'Choti Diwali', date: '2026-11-07' },
  { name: 'Diwali', date: '2026-11-08' },
  { name: 'Govardhan Puja', date: '2026-11-09' },
  { name: 'Bhai Dooj', date: '2026-11-11' },
  { name: 'Chhath Puja', date: '2026-11-15' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24' }
].map((h, i) => ({
  id: `HOL-CUS-${String(i + 1).padStart(3, '0')}`,
  ...h,
  type: 'National',
  description: ''
}));

export function withCustomHolidays(liveHolidays) {
  const customDates = new Set(CUSTOM_HOLIDAYS.map(h => h.date));
  const live = (liveHolidays || []).filter(h => !customDates.has(h.date));
  return [...live, ...CUSTOM_HOLIDAYS].sort((a, b) => a.date.localeCompare(b.date));
}
