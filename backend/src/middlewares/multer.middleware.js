// middlewares/multer.middleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/temp")); // Make sure the path is correct
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// PDF-only filter
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

export { upload };
