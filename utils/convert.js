// utils/convert.js
import fs from "fs";
import path from "path";
import heicConvert from "heic-convert";
import { UPLOADS_DIR, CONVERTED_DIR } from "../config.js";

export async function convertAllHEIC(toFormat = "jpeg") {
  const files = fs.readdirSync(UPLOADS_DIR);
  const heicFiles = files.filter((f) => f.toLowerCase().endsWith(".heic"));

  if (!fs.existsSync(CONVERTED_DIR)) {
    fs.mkdirSync(CONVERTED_DIR);
  }

  if (heicFiles.length === 0) {
    console.log("⚠️ No HEIC files found in uploads folder.");
    return { message: "No HEIC files found in uploads folder." };
  }

  const validFormats = ["JPEG", "PNG"];
  const formatUpper = toFormat.toUpperCase();

  if (!validFormats.includes(formatUpper)) {
    console.log(`⚠️ Invalid format: ${toFormat}. Defaulting to JPEG.`);
  }

  const finalFormat = validFormats.includes(formatUpper) ? formatUpper : "JPEG";
  console.log(`🖼 Found ${heicFiles.length} HEIC files to convert → ${finalFormat}`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < heicFiles.length; i++) {
    const file = heicFiles[i];
    const inputPath = path.join(UPLOADS_DIR, file);
    const outputFileName = file.replace(/\.heic$/i, `.${finalFormat.toLowerCase()}`);
    const outputPath = path.join(CONVERTED_DIR, outputFileName);

    console.log(`🔄 [${i + 1}/${heicFiles.length}] Converting: ${file}...`);

    try {
      const inputBuffer = fs.readFileSync(inputPath);

      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: finalFormat, 
        quality: 1.0,
      });

      fs.writeFileSync(outputPath, outputBuffer);
      console.log(`✅ Done: ${outputFileName}`);
      results.push({ file: outputFileName, status: "converted" });
    } catch (err) {
      console.error(`❌ Failed to convert ${file}: ${err.message}`);
      results.push({ file, status: "error", error: err.message });
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🏁 All conversions completed in ${totalTime} seconds.`);

  return results;
}
