const AWS = require('aws-sdk');

// Initialize SES
const ses = new AWS.SES({ region: process.env.AWS_REGION });

// Function to send an email
const emailVerification = async (to, subject, body) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: 'no-reply@email.ankush.me', 
  };

  return ses.sendEmail(params).promise();
};

module.exports = { emailVerification };
