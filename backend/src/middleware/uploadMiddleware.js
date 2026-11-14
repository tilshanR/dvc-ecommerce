/**
 * need a reusable middleware to catch incoming files,
 *  hold them in memory and validate that they are actually images.
 */
import multer from "multer";

// Use memory storage to avoid Vercel ephemeral file system issues
const storage = multer.memoryStorage();

// Ensure the user is only uploading images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
});