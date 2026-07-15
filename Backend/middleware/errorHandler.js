export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
}

export function handleError(error, req, res) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
}
