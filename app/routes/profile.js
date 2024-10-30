const express = require("express");
const ProfileModel = require("../models/profile");
const UserModel = require("../models/user");

const router = express.Router();

module.exports = (sequelize) => {
  const Profile = ProfileModel(sequelize);
  const User = UserModel(sequelize);

  // Add or Update Profile Image
  router.post("/v1/user/self/pic", async (req, res) => {
    try {
      const { userId } = req.user; // Assume req.user is set after authentication
      const { file_name, url} = req.body;

      const allowedFields = ["file_name", "url",];
      const invalidFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
      );

      // return 400 for invalid fields
      if (invalidFields.length > 0) {
        return res.status(400).json({message: "Bad request"});
      }

      // Validate input
      if (!file_name || !url) {
        return res.status(400).json({ message: "Bad Request" });
      }

      // Check if the user already has a profile image
      let profile = await Profile.findOne({ where: { userId } });

      if (profile) {
        // Update existing profile image
        profile.fileName = file_name;
        profile.url = url;
        await profile.save();
      } else {
        // Create new profile image
        profile = await Profile.create({ file_name, url });
      }

      res.status(201).json({
        message: profile ? "Profile image updated successfully" : "	Profile pic added/updated",
        profile,
      });
    } catch (error) {
      console.error("Error adding/updating profile image:", error);
      res
        .status(503)
        .set("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    }
  });

  // Get Profile Image
  router.get("/v1/user/self/pic", async (req, res) => {
    try {
      const { userId } = req.user;

      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        return res.status(404).json({ message: "Profile image not found" });
      }

      res.json({
        id: profile.id,
        fileName: profile.fileName,
        url: profile.url,
        upload_date: profile.upload_date,
        userId: profile.userId
      });
    } catch (error) {
      console.error("Error retrieving profile image:", error);
      res
        .status(503)
        .set("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    }
  });

  // Delete Profile Image
  router.delete("/v1/user/self/pic", async (req, res) => {
    try {
      const { userId } = req.user;

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
      
      const deletedProfile = await Profile.destroy({ where: { userId } });
      if (!deletedProfile) {
        return res.status(404).json();
      }

      res.status(204).json();
    } catch (error) {
      console.error("Error deleting profile image:", error);
      res
        .status(503)
        .set("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    }
  });
}