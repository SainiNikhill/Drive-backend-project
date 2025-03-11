const multer = require("multer");

const storage = multer.memoryStorage(); // Keep files in memory to upload to Supabase
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB (optional)
});

module.exports = upload;
