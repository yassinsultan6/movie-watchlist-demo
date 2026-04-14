
const formatErrorResponse = (statusCode, message, type = 'Error', errors = []) => ({
  status: 'error',
  statusCode,
  type,
  message,
  errors
});

const errorHandler = (err, req, res, next) => {
  console.error(err); 

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let type = 'Error';
  let errors = [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    type = 'ValidationError';
    message = 'Validation error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    type = 'CastError';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  
  if (err.code && err.code === 11000) {
    statusCode = 409;
    type = 'DuplicateKeyError';
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
    type = 'AuthenticationError';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    type = 'TokenExpiredError';
    message = 'Token expired';
  }

  
  res.status(statusCode).json(formatErrorResponse(statusCode, message, type, errors));
};

module.exports = errorHandler;
