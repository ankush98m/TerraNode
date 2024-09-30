const express = require("express");
const UserModel = require("../models/user");
const bcrypt = require("bcrypt");


const router = express.Router();
module.exports = (sequelize) => {
  
  const User = UserModel(sequelize);

  // post request to add a user
  router.post("/v1/user", async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;

      // checking for existing user
      const isExistingUser = await User.findOne({ where: { email } });
      if (isExistingUser) {
        return res.status(400).json({
          message: "User already exists"
        });
      }

      // creating the user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password
      });

      // set the response
      res.status(201).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        account_created: user.account_created,
        account_updated: user.account_updated,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};