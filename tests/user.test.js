
const { Sequelize } = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
    process.env.DB_DATABASE_TEST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
    }
  );

const request = require("supertest");
const express = require("express");
const userRoutes = require("../app/routes/user"); 
const User = require("../app/models/user")(sequelize)

const app = express();
const bodyParser = require("body-parser");

// Sync the models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

app.use(bodyParser.json());
// app.use(userRoutes);
app.use(userRoutes(sequelize));

describe('User API', () => {
    let testUserEmail = 'test.user@example.com'; 
  
    // Setup the database before all tests
    beforeAll(async () => {
      await sequelize.sync({ force: true }); 
    });
  
    // Clean and destroy up the database after all tests
    afterAll(async () => {
      await User.destroy({
        where: { email: testUserEmail }, 
      });
  
      await sequelize.close(); // Close the database connection
    })

    // Test suite for user creation
describe('POST /user', () => {
    it('should create a new user successfully', async () => {
      const res = await request(app)
        .post('/v1/user')
        .send({
          first_name: 'Test',
          last_name: 'User',
          password: 'test123',
          email: testUserEmail, 
        });
  
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        first_name: 'Test',
        last_name: 'User',
        email: testUserEmail,
      });
    });
  
    it('should return an error if user already exists', async () => {
      const res = await request(app)
        .post('/v1/user')
        .send({
          first_name: 'Test',
          last_name: 'User',
          password: 'test123',
          email: testUserEmail, 
        });
  
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  
    it('should return an error if extra fields are provided', async () => {
      const res = await request(app)
        .post('/v1/user')
        .send({
          first_name: 'Test',
          last_name: 'User',
          password: 'test123',
          email: testUserEmail,
          city: 'Boston', // Extra field
        });
  
      expect(res.statusCode).toBe(400);
    });
  });
})
