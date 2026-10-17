// An account may sign in only if no status field marks it as anything other
// than Active. The shared employee collection can carry the other app's
// `status` as well as our `employmentStatus`, so both are checked — either
// one being non-Active blocks access.
export function isAccountActive(employee) {
  const statuses = [employee?.status, employee?.employmentStatus].filter(Boolean);
  return statuses.every(status => status === 'Active');
}
