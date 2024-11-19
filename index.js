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

// Setup Sequelize for DB connection
// const sequelize = new Sequelize(
//   process.env.DB_DATABASE,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: "postgres",
//     logging: false,
//   }
// );

// Sequelize Model for User Verification
// const EmailLog = sequelize.define(
//   "EmailLog",
//   {
//     id: {
//       type: DataTypes.UUID,
//       allowNull: true,
//       defaultValue: Sequelize.UUIDV4,
//       primaryKey: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     token: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     email_sent_time: {
//       type: DataTypes.DATE,
//       defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//       allowNull: false,
//     },
//     email_verified_time: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: false,
//   }
// );

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

    // Check DB connection
    // const isDBUp = await checkDBConnection();
    // if (isDBUp) {
    //   const token = await createToken(userData);
    //   if (token) {
    //     await sendEmail(token, userData.email);
    //     return { statusCode: 200, body: "Email sent successfully." };
    //   }
    // }

    await sendEmail(userData.token, userData.email);
    return { statusCode: 200, body: "Email sent successfully." };
    logger.error("Error in processing SNS message", { error: error.message });
    return { statusCode: 500, body: "Error processing request." };
  } catch (error) {
    console.error("Error in processing:", error);
    return { statusCode: 400, body: JSON.stringify(error) };
  }
};

// Check DB connection
// async function checkDBConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log("Database is running");
//     logger.info("Database connection is healthy.");
//     return true;
//   } catch (error) {
//     logger.error("Database connection failed", { error: error.message });
//     console.error("Database failed to run", error);
//     return false;
//   }
// }

// Create a new user verification record
// async function createToken(userDetails) {
//   try {
//     // Generate a random 32-byte token (256 bits)
//     const token = crypto.randomBytes(32).toString("hex");

//     // Store the token in the database or use it as needed
//     await EmailLog.create({
//       email: userDetails.email,
//       token: token,
//       email_sent_time: new Date(),
//       email_verified_time: null, // Initially set to null as it hasn't been verified yet
//     });

//     logger.info("Token created successfully for email:", userDetails.email);
//     // Return the generated token
//     return token;
//   } catch (error) {
//     logger.error("Error creating token for email:", { email: userDetails.email, error: error.message });
//     console.error("Error creating token:", error);
//     return null;
//   }
// }
