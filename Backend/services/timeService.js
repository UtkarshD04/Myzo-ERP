export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function buildId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}
