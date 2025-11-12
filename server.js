// server.js
import express from "express";
import cors from "cors";
import { convertAllHEIC } from "./utils/convert.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Simple endpoint to trigger conversion
app.get("/convert", async (req, res) => {
  const { format } = req.query; // optional ?format=png
  const toFormat = format === "png" ? "png" : "jpeg";

  try {
    const result = await convertAllHEIC(toFormat);
    res.json({ status: "success", format: toFormat, result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HEIC Converter Server running on http://localhost:${PORT}`);
  console.log(`📁 Place your .heic files inside the 'uploads' folder.`);
});
