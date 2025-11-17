/**
 * Global error handler middleware
 * Catches and formats all errors with detailed logging
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle Axios/API errors
  if (err.response && err.response.status) {
    return res.status(err.response.status).json({
      success: false,
      error: 'External API Error',
      message: err.response.data?.message || err.message,
      status: err.response.status
    });
  }

  // Handle generic errors
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
};

/**
 * 404 Not Found handler
 * Catches all undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    availableEndpoints: {
      setActivity: 'POST /setActivity',
      setSubscriptionDiscount: 'POST /setSubscriptionDiscount',
      setSubscriptionPaymentDate: 'POST /setSubscriptionPaymentDate'
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
