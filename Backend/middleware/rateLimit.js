// In-memory sliding-window limiter. Fine for the single-instance deployment;
// swap for a shared store if the API is ever scaled horizontally.
const buckets = new Map();

export function rateLimit(key, { max, windowMs }) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter(t => now - t < windowMs);

  if (hits.length >= max) {
    buckets.set(key, hits);
    const error = new Error('Too many attempts. Please try again in a few minutes.');
    error.statusCode = 429;
    throw error;
  }

  hits.push(now);
  buckets.set(key, hits);
}

// Drop stale buckets so the map can't grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    if (!hits.some(t => now - t < 60 * 60 * 1000)) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();
