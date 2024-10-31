// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: '/opt/webapp/logs/app.log',
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: '/opt/webapp/logs/error.log',
      level: 'error'
    })
  ]
});

// Add console transport if not in production
// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//       format: winston.format.simple()
//     }));
//   }
  
  // Export logger methods individually to ensure they exist
  module.exports = {
    info: (message, meta) => logger.info(message, meta),
    error: (message, meta) => logger.error(message, meta),
    warn: (message, meta) => logger.warn(message, meta),
    debug: (message, meta) => logger.debug(message, meta)
  };