// server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { convertSingleHEIC, convertAllHEIC } from "./utils/convert.js";
import { UPLOADS_DIR, CONVERTED_DIR } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR);
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isHEIC = file.originalname.toLowerCase().endsWith('.heic');
    if (isHEIC) {
      cb(null, true);
    } else {
      cb(new Error('Only HEIC files are allowed!'), false);
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/converted', express.static(CONVERTED_DIR));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload and convert single file
app.post('/upload', upload.single('heicFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const format = req.body.format || 'jpeg';
    const result = await convertSingleHEIC(req.file.filename, format);

    res.json({
      status: 'success',
      message: 'File converted successfully',
      originalFile: req.file.filename,
      convertedFile: result.outputFileName,
      downloadUrl: `/converted/${result.outputFileName}`
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Convert all files in uploads folder
app.get("/convert-all", async (req, res) => {
  const { format } = req.query; // optional ?format=png
  const toFormat = format === "png" ? "png" : "jpeg";

  try {
    const result = await convertAllHEIC(toFormat);
    res.json({ status: "success", format: toFormat, result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get list of converted files
app.get('/converted-files', (req, res) => {
  try {
    if (!fs.existsSync(CONVERTED_DIR)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(CONVERTED_DIR).map(file => ({
      name: file,
      downloadUrl: `/converted/${file}`
    }));

    res.json({ files });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Clear uploads and converted folders
app.delete('/clear', (req, res) => {
  try {
    // Clear uploads folder
    if (fs.existsSync(UPLOADS_DIR)) {
      const uploadFiles = fs.readdirSync(UPLOADS_DIR);
      uploadFiles.forEach(file => {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      });
    }

    // Clear converted folder
    if (fs.existsSync(CONVERTED_DIR)) {
      const convertedFiles = fs.readdirSync(CONVERTED_DIR);
      convertedFiles.forEach(file => {
        fs.unlinkSync(path.join(CONVERTED_DIR, file));
      });
    }

    res.json({ status: 'success', message: 'All files cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HEIC Converter Server running on http://localhost:${PORT}`);
  console.log(`📁 Open your browser and go to http://localhost:${PORT}`);
});
