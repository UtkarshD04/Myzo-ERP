// Independence Day (Aug 15) touch: active for a short run-up window rather
// than year-round, so the tricolor accents feel like a seasonal moment
// instead of permanent UI clutter.
export function isIndependenceDaySeason(date = new Date()) {
  const month = date.getMonth(); // 0-indexed: 7 = August
  const day = date.getDate();
  return month === 7 && day >= 10 && day <= 16;
}
