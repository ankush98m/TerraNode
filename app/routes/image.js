const express = require("express");
const ImageModel = require("../models/image");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const multer = require('multer');

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
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

    // Add or Update user Image
    router.post("/v1/user/self/pic", 
        authenticateUser,
        upload.single('file_name'),
        async (req, res) => {
            try {
                console.log("inside post req of pic");
                const userId = req.userId;
                
                if (!req.file) {
                    return res.status(400).json({ message: "Bad Request: No file uploaded" });
                }

                const file_name = req.file.originalname;
                const url = `bucket-name/${userId}/${file_name}`;

                let profile = await Image.findOne({ where: { user_id: userId } });

                if (profile) {
                    profile.file_name = file_name;
                    profile.url = url;
                    profile.upload_date = new Date();
                    await profile.save();
                } else {
                    profile = await Image.create({
                        file_name,
                        url,
                        user_id: userId,
                        upload_date: new Date()
                    });
                }

                res.status(201).json({
                    message: "Profile pic added/updated",
                    profile: {
                        file_name: profile.file_name,
                        id: profile.id,
                        url: profile.url,
                        upload_date: profile.upload_date.toISOString().split('T')[0],
                        user_id: profile.user_id,
                    },
                });
            } catch (error) {
                console.error("Error adding/updating profile image:", error);
                res
                    .status(503)
                    .set("Cache-Control", "no-cache, no-store, must-revalidate")
                    .send();
            }
    });

    // Get user Image
    router.get("/v1/user/self/pic", authenticateUser, async (req, res) => {
        try {
            console.log("inside get req of pic");
            const userId = req.userId;
            const profile = await Image.findOne({ where: { user_id: userId } });
            
            if (!profile) {
                return res.status(404).json({ message: "Profile image not found" });
            }

            res.json({
                id: profile.id,
                fileName: profile.file_name,
                url: profile.url,
                upload_date: profile.upload_date.toISOString().split('T')[0],
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
            const deletedProfile = await Image.destroy({ where: { user_id: userId } });
            
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

    return router;
};