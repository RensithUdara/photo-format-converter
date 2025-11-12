# 📸 HEIC Photo Converter

A modern, full-featured web application for converting HEIC (High Efficiency Image Container) photos to JPEG or PNG format. Built with Node.js, Express, and a beautiful responsive UI.

![HEIC Converter Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=HEIC+Photo+Converter)

## ✨ Features

### 🖼️ Image Conversion
- **Multi-format Support**: Convert HEIC files to JPEG or PNG
- **Batch Processing**: Upload and convert multiple files at once
- **High Quality**: Maintains image quality during conversion
- **Fast Processing**: Efficient conversion using the heic-convert library

### 🌐 Web Interface
- **Drag & Drop**: Intuitive file upload with drag-and-drop support
- **Real-time Progress**: Live conversion status and progress tracking
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### 📁 File Management
- **Bulk Operations**: Convert all, download all, or clear all files
- **Individual Control**: Convert, download, or remove files individually
- **File Statistics**: Track uploaded, converted, and ready files
- **Error Handling**: Clear error messages and retry functionality

### 🔧 Technical Features
- **RESTful API**: Clean API endpoints for programmatic access
- **Static File Serving**: Automatic serving of converted files
- **File Validation**: Ensures only HEIC files are processed
- **Error Recovery**: Robust error handling and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RensithUdara/photo-format-converter.git
   cd photo-format-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

That's it! Your HEIC converter is now running locally.

## 📖 Usage Guide

### Web Interface

1. **Upload Files**
   - Drag and drop HEIC files onto the upload area, or
   - Click the upload area to browse and select files
   - Multiple files can be uploaded simultaneously

2. **Choose Output Format**
   - Select JPEG (default) or PNG from the format dropdown
   - The format applies to all conversions

3. **Convert Files**
   - Files are automatically converted upon upload, or
   - Use "Convert All" for batch processing of existing uploads

4. **Download Results**
   - Click "Download" on individual files, or
   - Use "Download All" to get all converted files at once

5. **Manage Files**
   - Remove individual files with the trash icon
   - Clear all files with "Clear All" button

### API Endpoints

#### Upload and Convert Single File
```http
POST /upload
Content-Type: multipart/form-data

Form data:
- heicFile: [HEIC file]
- format: "jpeg" | "png" (optional, defaults to "jpeg")
```

#### Convert All Files in Uploads Folder
```http
GET /convert-all?format=jpeg
```

#### Get List of Converted Files
```http
GET /converted-files
```

#### Clear All Files
```http
DELETE /clear
```

#### Download Converted Files
```http
GET /converted/[filename]
```

## 📁 Project Structure

```
photo-format-converter/
├── 📄 server.js              # Main Express server
├── 📄 package.json           # Dependencies and scripts
├── 📄 config.js              # Configuration settings
├── 📂 utils/
│   └── 📄 convert.js          # HEIC conversion utilities
├── 📂 public/                 # Static web files
│   ├── 📄 index.html          # Main HTML page
│   ├── 📄 style.css           # Styling and responsive design
│   └── 📄 script.js           # Frontend JavaScript
├── 📂 uploads/                # Temporary storage for uploaded HEIC files
├── 📂 converted/              # Storage for converted files
└── 📄 README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Multer**: Middleware for handling file uploads
- **heic-convert**: Library for HEIC to JPEG/PNG conversion
- **CORS**: Cross-Origin Resource Sharing support

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with Flexbox/Grid and animations
- **Vanilla JavaScript**: ES6+ features, no frameworks needed
- **Font Awesome**: Beautiful icons
- **Responsive Design**: Mobile-first approach

## ⚙️ Configuration

### Environment Variables
You can customize the server by setting these environment variables:

```bash
PORT=5000                    # Server port (default: 5000)
UPLOADS_DIR=./uploads        # Upload directory
CONVERTED_DIR=./converted    # Converted files directory
```

### Server Configuration
Edit `config.js` to modify default directories:

```javascript
export const UPLOADS_DIR = path.join(__dirname, "uploads");
export const CONVERTED_DIR = path.join(__dirname, "converted");
```

## 🔧 Development

### Scripts
```bash
# Start the server
npm start

# Start with nodemon for development (install nodemon first)
npm run dev

# Install nodemon globally
npm install -g nodemon
```

### Adding to package.json scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 📝 API Response Examples

### Successful Upload Response
```json
{
  "status": "success",
  "message": "File converted successfully",
  "originalFile": "IMG_1234.heic",
  "convertedFile": "IMG_1234.jpeg",
  "downloadUrl": "/converted/IMG_1234.jpeg"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Only HEIC files are allowed!"
}
```

### Converted Files List
```json
{
  "files": [
    {
      "name": "IMG_1234.jpeg",
      "downloadUrl": "/converted/IMG_1234.jpeg"
    }
  ]
}
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **File Type Validation**: Only HEIC files are accepted
- **Upload Errors**: Network issues, file size limits
- **Conversion Errors**: Corrupt files, unsupported HEIC variants
- **Server Errors**: Disk space, permissions, processing failures
- **User Feedback**: Clear error messages and retry options

## 🔒 Security Considerations

- **File Type Validation**: Only HEIC files are processed
- **File Size Limits**: Configure multer limits as needed
- **Input Sanitization**: File names and paths are sanitized
- **CORS Configuration**: Adjust CORS settings for production
- **Rate Limiting**: Consider adding rate limiting for production use

## 🚀 Deployment

### Local Development
The application runs on `http://localhost:5000` by default.

### Production Deployment

#### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "heic-converter"

# Monitor
pm2 monit
```

#### Using Docker
Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t heic-converter .
docker run -p 5000:5000 heic-converter
```

#### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [heic-convert](https://github.com/catdad-experiments/heic-convert) - Core conversion library
- [Express.js](https://expressjs.com/) - Web framework
- [Multer](https://github.com/expressjs/multer) - File upload handling
- [Font Awesome](https://fontawesome.com/) - Icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/RensithUdara/photo-format-converter/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer: [RensithUdara](https://github.com/RensithUdara)

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Basic HEIC to JPEG/PNG conversion
- Web interface with drag-and-drop
- Batch processing capabilities
- RESTful API endpoints
- Responsive design
- Error handling and user feedback

---

Made with ❤️ by [RensithUdara](https://github.com/RensithUdara)