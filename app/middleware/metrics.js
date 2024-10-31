const StatsD = require('node-statsd');
const AWS = require('aws-sdk');

// Initialize StatsD client
const statsdClient = new StatsD({
    host: '127.0.0.1', // Replace with StatsD host if different
    port: 8125     
});

// Middleware to log API call count and response time
const apiMetricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        // Increment call count for each API endpoint
        statsdClient.increment(`api.${req.method}.${req.path}.count`);

        // Record response time
        statsdClient.timing(`api.${req.method}.${req.path}.response_time`, duration);
    });

    next();
};

// Helper functions to time database and S3 calls
const timeDatabaseQuery = async (queryFunc) => {
    const dbStart = Date.now();
    const result = await queryFunc();
    statsdClient.timing('database.query.response_time', Date.now() - dbStart);
    return result;
};

const timeS3Operation = async (s3Operation) => {
    const s3Start = Date.now();
    const result = await s3Operation;
    statsdClient.timing('aws.s3.call.response_time', Date.now() - s3Start);
    return result;
};

module.exports = {
    statsdClient,
    apiMetricsMiddleware,
    timeDatabaseQuery,
    timeS3Operation,
};
