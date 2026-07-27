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
