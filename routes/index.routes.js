const express = require("express");
const router = express.Router();
const fileModel = require("../models/file.model");
const authMiddleware = require("../middleware/auth");
const supabase = require("../config/supabase");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage

// GET Home Page
router.get("/home", authMiddleware, async (req, res) => {
  try {
    let userFiles = await fileModel.find({ user: req.user.userId });

    // Generate signed URLs for each file
    for (let file of userFiles) {
      const { data, error } = await supabase.storage
        .from("drive")
        .createSignedUrl(file.filePath, 60 * 60); // URL valid for 1 hour

      if (!error) {
        file.signedUrl = data.signedUrl;
      }
    }

    res.render("home", { files: userFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// POST Upload File (Supabase)
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const fileBuffer = req.file.buffer;
      const filePath = `uploads/${req.user.userId}/${Date.now()}_${
        req.file.originalname
      }`;

      // Upload file to Supabase Storage (Private Bucket)
      const { data, error } = await supabase.storage
        .from("drive")
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      // Save File Info in MongoDB (Store filePath instead of public URL)
      const newFile = await fileModel.create({
        filePath: filePath, // Store file path for signed URL generation
        originalname: req.file.originalname,
        user: req.user.userId,
        createdAt: new Date(),
      });

      res.redirect("/home");
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }
  }
);




// GET Download File (Only the Owner)
router.get("/download/:fileId", authMiddleware, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.userId; // Get user ID from token

    // Find the file in MongoDB
    const file = await fileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the logged-in user is the file owner
    if (file.user.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Generate a signed URL for secure download (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from("drive")
      .createSignedUrl(file.filePath, 60 * 60); // 1 hour expiration

    if (error) throw error;

    // Send the signed URL to the frontend
     res.redirect(data.signedUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});





module.exports = router;
