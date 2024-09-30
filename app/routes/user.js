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
          message: "User already exists",
        });
      }

      // creating the user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
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

  // get request to retreive user information
  router.get("/v1/user/self", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      // check authheader exist or not
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // extract username and password from authheader
      const [username, password] = Buffer.from(
        authHeader.split(" ")[1],
        "base64"
      )
        .toString()
        .split(":");
      const user = await User.findOne({ where: { email: username } });

      // check password matches or not
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        account_created: user.account_created,
        account_updated: user.account_updated,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.put("/v1/user/self", async (req, res) => {
    try {
        console.log("in put api")
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // extract username and password from authheader
      const [username, password] = Buffer.from(
        authHeader.split(" ")[1],
        "base64"
      )
        .toString()
        .split(":");
      const user = await User.findOne({ where: { email: username } });

      // check password matches or not
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { first_name, last_name, password: newPassword } = req.body;
      
      const allowedFields = ["first_name", "last_name", "password"];
      const invalidFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
      );

      // return 400 for invalid fields
      if (invalidFields.length > 0) {
        return res.status(400).json({message: "Bad request"});
      }

      // return 204 when all fields are empty
      if(first_name == undefined && last_name == undefined && newPassword == undefined){
        return res.status(204).json({ message: "No content" })
      }

      // updating fields
      if (first_name && first_name.length > 0) {
        user.first_name = first_name;
      }
      if (last_name && last_name.length > 0) {
        user.last_name = last_name;
      }
      if (newPassword && newPassword.length > 0) {
        user.password = newPassword;
      }

      await user.save();

      res.json({
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
