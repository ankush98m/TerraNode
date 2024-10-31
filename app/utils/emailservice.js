const sgMail = require('@sendgrid/mail');
const logger = require('./logger'); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to: to,
      from: process.env.SENDER_EMAIL, 
      subject: subject,
      text: text,
    };
    
    await sgMail.send(msg);
    logger.info('Email sent successfully', { to, subject });
  } catch (error) {
    logger.error('Error sending email', { error: error.message });
    throw error;
  }
};

module.exports = {
  sendEmail
};