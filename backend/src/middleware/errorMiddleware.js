
const errorMiddleware = (err, req, res, next) => {
  // If the response has already been sent,
  // delegate the error to Express.
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error."
        : err.message,
  });
};

export default errorMiddleware;
