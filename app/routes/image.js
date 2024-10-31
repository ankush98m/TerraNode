const express = require("express");
const ImageModel = require("../models/image");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { v4: uuidv4 } = require("uuid"); // For unique image names

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = (sequelize) => {
  const router = express.Router();
  const Image = ImageModel(sequelize);
  const User = UserModel(sequelize);

  // Middleware to authenticate user
  async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("inside middleware");
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");

    try {
      const user = await User.findOne({ where: { email: username } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("userid:", user.id);
      req.userId = user.id;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(503).send("Service Unavailable");
    }
  }

  router.head("/v1/user/self/pic", async (req, res) => {
    return res
      .status(405)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  });

  // Add or Update user Image
  router.post(
    "/v1/user/self/pic",
    authenticateUser,
    upload.single("file_name"),
    async (req, res) => {
      try {
        logger.info('Starting image upload process', { userId: req.userId });
        const userId = req.userId;

        if (Object.keys(req.body).length > 0) {
          return res.status(400).json();
        }

        if (!req.file) {
          return res.status(400).json({ message: "Bad Request: No file uploaded" });
        }

        // First find if user already has an image
        let profile = await Image.findOne({ where: { user_id: userId } });
        
        // If profile exists, delete the old image from S3 first
        if (profile) {
          try {
            const deleteParams = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: profile.file_name // Use the existing file_name as the key
            };
            await s3.deleteObject(deleteParams).promise();
            logger.info('Deleted old image from S3', { key: profile.file_name });
          } catch (deleteError) {
            logger.error('Error deleting old image from S3', { error: deleteError });
          }
        }

        // Upload new image
        const fileContent = req.file.buffer;
        const file_name = `${userId}/${uuidv4()}_${req.file.originalname}`;
        
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file_name,
          Body: fileContent,
          ContentType: req.file.mimetype,
        };

        const s3Data = await s3.upload(uploadParams).promise();
        const url = s3Data.Location;

        if (profile) {
          // Update existing record
          profile.file_name = file_name;
          profile.url = url;
          profile.upload_date = new Date();
          await profile.save();
        } else {
          // Create new record
          profile = await Image.create({
            file_name,
            url,
            user_id: userId,
            upload_date: new Date(),
          });
        }

        return res.status(201).json({
          message: "Profile pic added/updated",
          profile: {
            file_name: profile.file_name,
            id: profile.id,
            url: profile.url,
            upload_date: profile.upload_date.toISOString().split("T")[0],
            user_id: profile.user_id,
          },
        });
      } catch (error) {
        logger.error('Error in image upload process', {
          error: error.message,
          stack: error.stack,
          userId: req.userId
        });

        return res
          .status(503)
          .set("Cache-Control", "no-cache, no-store, must-revalidate")
          .json({ message: "Service temporarily unavailable" });
      }
    }
);

  // Get user Image
  router.get("/v1/user/self/pic", authenticateUser, async (req, res) => {
    try {
      console.log("inside get req of pic");
      const userId = req.userId;

      // Check for additional fields in form-data
      if (Object.keys(req.body).length > 0) {
        return res.status(400).json();
      }

      const profile = await Image.findOne({ where: { user_id: userId } });

      if (!profile) {
        return res.status(404).json({ message: "Profile image not found" });
      }

      res.json({
        id: profile.id,
        fileName: profile.file_name,
        url: profile.url,
        upload_date: profile.upload_date.toISOString().split("T")[0],
        user_id: profile.user_id,
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
  router.delete("/v1/user/self/pic", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;

      // Check for additional fields in form-data
      if (Object.keys(req.body).length > 0) {
        return res.status(400).json();
      }

      const profile = await Image.findOne({ where: { user_id: userId } });
      if (!profile) {
        return res.status(404).json();
      }

      // Remove image from S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: profile.file_name,
      };
      await s3.deleteObject(params).promise();

      // Remove image record from database
      await Image.destroy({ where: { user_id: userId } });

      res.status(204).json();
    } catch (error) {
      console.error("Error deleting profile image:", error);
      res
        .status(503)
        .set("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    }
  });

  // return 405 for all other methods
  router.all("/v1/user/self/pic", async (req, res) => {
    return res
      .status(405)
      .set("Cache-Control", "no-cache", "no-store", "must-revalidate")
      .send();
  });

  return router;
};
