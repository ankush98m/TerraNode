const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres', 
});

const EmailLog = sequelize.define('EmailLog', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  verificationLink: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expirationTime: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = { sequelize, EmailLog };
