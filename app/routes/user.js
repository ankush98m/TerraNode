const express = require("express");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");

const router = express.Router();
module.exports = (sequelize) => {
  const User = UserModel(sequelize);

  router.head("/v1/user/self", async(req, res)=>{
    return res
      .status(405)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  })

  // post request to add a user
  router.post("/v1/user", async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;

      // validate if the fields are string
      if (!validate_input(first_name, last_name, password, email)) {
        return res.status(400).json({
          message: "Bad Request",
        });
      }

      // validate email format
      if(!emailFormat(email)){
        return res.status(400).json({
          message: "Bad Request",
        });
      }

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
      res
      .status(503)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
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

      // no req body should be allowed
      if (req.body && Object.keys(req.body).length > 0) {
        return res.status(400).send();
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
      res
      .status(503)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
    }
  });

  router.put("/v1/user/self", async (req, res) => {
    try {
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

      // validate if the fields are string
      if(first_name!= undefined){
        if(first_name !== 'string' && first_name.trim() === ''){
          return res.status(400).json({ message: "Bad Request" });
        }
      }
      if(last_name!= undefined){
        if(last_name !== 'string' && last_name.trim() === ''){
          return res.status(400).json({ message: "Bad Request" });
        }
      }
      if(newPassword!= undefined){
        if(newPassword !== 'string' && newPassword.trim() === ''){
          return res.status(400).json({ message: "Bad Request" });
        }
      }
      
      
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
        return res.status(400).json({ message: "Bad Request" })
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

      res.status(204).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        account_created: user.account_created,
        account_updated: user.account_updated,
      });
    } catch (err) {
      console.error(err);
      res
      .status(503)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
    }
  });

  // return 405 for all other methods
  router.all("/v1/user/self", async(req, res)=>{
    return res
      .status(405)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  })

  return router;
};

function validate_input(first_name, last_name, password, email) {
  return (
    typeof first_name === "string" &&
    typeof last_name === "string" &&
    typeof email === "string" &&
    typeof password === "string"
  );
}

function emailFormat(email){
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return pattern.test(email);
}