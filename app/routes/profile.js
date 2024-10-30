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
      const { file_name, url, upload_date} = req.body;

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
        profile.upload_date = upload_date
        await profile.save();
      } else {
        // Create new profile image
        profile = await Profile.create({ userId, file_name, url });
      }

      res.status(200).json({
        message: profile ? "Profile image updated successfully" : "Profile image added successfully",
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
}