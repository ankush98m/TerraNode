const StatsD = require('node-statsd');
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });

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

        // Count API calls
        cloudwatch.putMetricData({
            Namespace: 'Webapp/API',
            MetricData: [
                {
                    MetricName: `${req.method}_${req.path}_count`,
                    Dimensions: [
                        { Name: 'API', Value: `${req.method}_${req.path}` }
                    ],
                    Value: 1,
                    Unit: 'Count'
                },
                {
                    MetricName: `${req.method}_${req.path}_response_time`,
                    Dimensions: [
                        { Name: 'API', Value: `${req.method}_${req.path}` }
                    ],
                    Value: duration,
                    Unit: 'Milliseconds'
                }
            ]
        }, (err, data) => {
            if (err) console.error("Error sending metrics to CloudWatch", err);
        });
    });

    next();
};

// Helper functions to time database and S3 calls
const timeDatabaseQuery = async (queryFunc) => {
    const start = Date.now();
    const result = await queryFunc();
    const duration = Date.now() - start;

    cloudwatch.putMetricData({
        Namespace: 'Webapp/Database',
        MetricData: [
            {
                MetricName: 'query_response_time',
                Value: duration,
                Unit: 'Milliseconds'
            }
        ]
    }, (err, data) => {
        if (err) console.error("Error sending database metrics", err);
    });

    return result;
};

const timeS3Operation = async (s3Operation) => {
    const start = Date.now();
    const result = await s3Operation;
    const duration = Date.now() - start;

    cloudwatch.putMetricData({
        Namespace: 'Webapp/S3',
        MetricData: [
            {
                MetricName: 's3_operation_response_time',
                Value: duration,
                Unit: 'Milliseconds'
            }
        ]
    }, (err, data) => {
        if (err) console.error("Error sending S3 metrics", err);
    });

    return result;
};

module.exports = {
    apiMetricsMiddleware,
    timeDatabaseQuery,
    timeS3Operation,
};
