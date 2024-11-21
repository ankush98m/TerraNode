const { SNSClient } = require("@aws-sdk/client-sns");
const sendgrid = require("@sendgrid/mail");
const { Sequelize, DataTypes } = require("sequelize");
const winston = require("winston");
const crypto = require("crypto");

// Configure winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

// AWS SNS client setup
const snsClient = new SNSClient({
  region: "us-east-1", // Change to your desired AWS region
});

// SendGrid client setup
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (token, email) => {
  const verificationLink = `http://${process.env.DOMAIN}/user/verify?token=${token}`;

  const msg = {
    to: email,
    from: "no-reply@email.ankushm.me", // Your verified SendGrid sender email
    subject: "Verify User",
    text: `Please click the link below to verify your email: ${verificationLink}`,
  };

  try {
    await sendgrid.send(msg);
    console.log("Email sent successfully to:", username);
    logger.info(`Email sent successfully to: ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    logger.error(`Error sending email to ${email}: ${error.message}`);
  }
};

// Lambda handler function for AWS
exports.handler = async (event) => {
  try {
    // Extract base64 data from SNS message
    const userData = JSON.parse(event.Records[0].Sns.Message);
    // const userData = Buffer.from(base64name, "base64").toString();
    logger.info("Received user data from SNS", { userData });
    console.log("userData:", userData);
    if (!userData) {
      logger.error("Invalid or missing email in SNS message.");
      console.error("Invalid SNS message received.");
      return;
    }

    // const jsonData = JSON.parse(userData);
    // Validate required fields
    if (!userData || !userData.email) {
      console.error("Invalid or missing email in SNS message.");
      return {
        statusCode: 400,
        body: "Invalid or missing email in SNS message.",
      };
    }

    logger.info("Data received from SNS:", { email: userData.email });
    console.log("Data received from SNS:", userData.email);

    await sendEmail(userData.token, userData.email);
    return { statusCode: 200, body: "Email sent successfully." };
    logger.error("Error in processing SNS message", { error: error.message });
    return { statusCode: 500, body: "Error processing request." };
  } catch (error) {
    console.error("Error in processing:", error);
    return { statusCode: 400, body: JSON.stringify(error) };
  }
};
