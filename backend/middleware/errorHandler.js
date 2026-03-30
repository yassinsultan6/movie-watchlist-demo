
const formatErrorResponse = (statusCode, message, errors = []) => ({
  status: 'error',
  statusCode,
  message,
  errors
});

const errorHandler = (err, req, res, next) => {
  console.error(err); 

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  
  if (err.code && err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    message = `Duplicate value for field(s): ${fields.join(', ')}`;
    errors = [
      {
        field: fields.join(', '),
        message: 'Value must be unique'
      }
    ];
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  
  res.status(statusCode).json(formatErrorResponse(statusCode, message, errors));
};

module.exports = errorHandler;
