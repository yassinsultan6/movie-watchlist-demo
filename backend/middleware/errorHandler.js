
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

  if (err.type === 'ValidationError') {
    statusCode = err.status || 400;
    type = 'ValidationError';
    message = err.message || 'Validation error';
    errors = Array.isArray(err.errors) ? err.errors : [];
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    type = 'ValidationError';
    message = 'Poster file must be less than 5MB';
    errors = [{ field: 'posterFile', message: 'Poster file must be less than 5MB' }];
  } else if (err.message && err.message.includes('Unsupported file type')) {
    statusCode = 400;
    type = 'ValidationError';
    message = err.message;
    errors = [{ field: 'posterFile', message: err.message }];
  } else if (err.name === 'ValidationError') {
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
