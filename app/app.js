require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const { Sequelize } = require("sequelize");
const userRoutes = require("./routes/user");
const imageRoutes = require("./routes/image");
const AWS = require("aws-sdk");
const metrics = require("./middleware/metrics");
const logger = require("./utils/logger");

AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
});

const sns = new AWS.SNS();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
  }
);

// Sync the models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  logger.info("Request received", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  next();
});

app.use(express.json());
app.use(metrics.apiMetricsMiddleware);
app.use(metrics.timeDatabaseQuery);
app.use(metrics.timeS3Operation);

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    logger.info("Response sent", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
    });
    return originalSend.call(this, body);
  };
  next();
});

// creating tables
app.use(userRoutes(sequelize));
app.use(imageRoutes(sequelize));

// no query parameter allowed
app.use((req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    return res.status(400).send();
  }
  next();
});

// no head request allowed
app.head("/healthz", async (req, res) => {
  return res
    .status(405)
    .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
    .send();
});

app.get("/healthz", async (req, res) => {
  // No payload allowed
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      return res.status(400).send();
    }

    // Connect to the database
    await sequelize.authenticate();
    res
      .status(200)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  } catch (err) {
    console.error("Database connection error:", err);
    // Send 503 if the database connection fails
    res
      .status(503)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  }
});

// Handle unsupported HTTP methods for the /healthz endpoint
app.all("/healthz", (req, res) => {
  if (req.method != "GET") {
    return res
      .status(405)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  }
});

// Handle all other endpoints with a 404 status code
app.all("*", (req, res) => {
  res.status(404).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res
    .status(503)
    .send()
    .set("Cache-Control", "no-cache", "no-store", "must-revalidate");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Webapp listening on port ${port}`);
});
