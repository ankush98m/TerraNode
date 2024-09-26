require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.get("/healthz", async (req, res) => {
  // No payload allowed
  if (req.body && Object.keys(req.body).length > 0) {
    return res.status(400).send();
  }
  try {
    // Connect to the database
    await pool.connect();
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
  res.status(405).set("Cache-Control", "no-cache").send();
});

app.listen(port, () => {
  console.log(`Webapp listening on port ${port}`);
});
