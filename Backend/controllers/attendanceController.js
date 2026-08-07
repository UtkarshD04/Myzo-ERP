import { checkIn, checkOut, requestLateCheckout, reviewLateCheckoutRequest } from '../services/attendanceService.js';
import { filterAttendanceForViewer } from '../models/attendanceModel.js';
import { filterLateCheckoutRequestsForViewer, findAllLateCheckoutRequests } from '../models/lateCheckoutRequestModel.js';

// Attendance must be geo-tagged, so a request with no (or malformed) location
// is rejected here — the one place both endpoints funnel through — rather
// than trusting the frontend to have refused to send it.
function requireLocation(location) {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    const error = new Error('Location access is required to punch in/out. Please allow location permission in your browser and try again.');
    error.statusCode = 400;
    throw error;
  }
}

export async function checkInEmployee(req, res) {
  // employeeId comes from the verified JWT, never the body — otherwise any
  // employee could check another employee in/out by passing their id.
  requireLocation(req.body.location);
  const result = await checkIn({ employeeId: req.user.id, location: req.body.location });
  res.status(201).json({ ...result, attendance: filterAttendanceForViewer(result.attendance, req.user) });
}

export async function checkOutEmployee(req, res) {
  requireLocation(req.body.location);
  const result = await checkOut({ employeeId: req.user.id, location: req.body.location });
  res.json({ ...result, attendance: filterAttendanceForViewer(result.attendance, req.user) });
}

export async function getLateCheckoutRequests(req, res) {
  const lateCheckoutRequests = filterLateCheckoutRequestsForViewer(await findAllLateCheckoutRequests(), req.user);
  res.json({ lateCheckoutRequests });
}

export async function submitLateCheckoutRequest(req, res) {
  requireLocation(req.body.location);
  const result = await requestLateCheckout({
    employeeId: req.user.id,
    location: req.body.location,
    reason: req.body.reason
  });
  res.status(201).json({ ...result, lateCheckoutRequests: filterLateCheckoutRequestsForViewer(result.lateCheckoutRequests, req.user) });
}

export async function modifyLateCheckoutRequest(req, res) {
  const result = await reviewLateCheckoutRequest(req.params.id, req.body, req.user);
  res.json({
    ...result,
    lateCheckoutRequests: filterLateCheckoutRequestsForViewer(result.lateCheckoutRequests, req.user),
    attendance: filterAttendanceForViewer(result.attendance, req.user)
  });
}
