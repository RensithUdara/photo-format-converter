# 🚀 API Usage Examples

This document provides examples of how to use the HEIC Converter API programmatically.

## Base URL
```
http://localhost:5000
```

## 📤 Upload and Convert Single File

### JavaScript (Fetch API)
```javascript
async function uploadAndConvert(file, format = 'jpeg') {
    const formData = new FormData();
    formData.append('heicFile', file);
    formData.append('format', format);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            console.log('Conversion successful:', result);
            // Download the converted file
            const downloadLink = document.createElement('a');
            downloadLink.href = result.downloadUrl;
            downloadLink.download = result.convertedFile;
            downloadLink.click();
        } else {
            console.error('Conversion failed:', result.message);
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

// Usage with file input
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.heic')) {
        uploadAndConvert(file, 'jpeg');
    }
});
```

### cURL
```bash
# Upload and convert a HEIC file to JPEG
curl -X POST \
  -F "heicFile=@path/to/your/image.heic" \
  -F "format=jpeg" \
  http://localhost:5000/upload

# Upload and convert to PNG
curl -X POST \
  -F "heicFile=@path/to/your/image.heic" \
  -F "format=png" \
  http://localhost:5000/upload
```

### Python (requests)
```python
import requests

def upload_and_convert(file_path, format='jpeg'):
    url = 'http://localhost:5000/upload'
    
    with open(file_path, 'rb') as file:
        files = {'heicFile': file}
        data = {'format': format}
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            if result['status'] == 'success':
                print(f"Conversion successful: {result['convertedFile']}")
                # Download the converted file
                download_url = f"http://localhost:5000{result['downloadUrl']}"
                download_response = requests.get(download_url)
                
                with open(result['convertedFile'], 'wb') as output_file:
                    output_file.write(download_response.content)
                    
                print(f"Downloaded: {result['convertedFile']}")
            else:
                print(f"Conversion failed: {result['message']}")
        else:
            print(f"Upload failed: {response.status_code}")

# Usage
upload_and_convert('path/to/your/image.heic', 'jpeg')
```

## 🔄 Convert All Files
```javascript
async function convertAllFiles(format = 'jpeg') {
    try {
        const response = await fetch(`/convert-all?format=${format}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            console.log('All files converted:', result);
        } else {
            console.error('Conversion failed:', result.message);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}
```

## 📁 Get Converted Files List
```javascript
async function getConvertedFiles() {
    try {
        const response = await fetch('/converted-files');
        const result = await response.json();
        
        console.log('Available files:', result.files);
        
        // Download all files
        result.files.forEach(file => {
            const link = document.createElement('a');
            link.href = file.downloadUrl;
            link.download = file.name;
            link.click();
        });
    } catch (error) {
        console.error('Request failed:', error);
    }
}
```

## 🗑️ Clear All Files
```javascript
async function clearAllFiles() {
    try {
        const response = await fetch('/clear', { method: 'DELETE' });
        const result = await response.json();
        
        if (result.status === 'success') {
            console.log('All files cleared');
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}
```

## 📱 Complete Example: Mobile App Integration

### React Native Example
```javascript
import { DocumentPicker } from 'react-native-document-picker';

export class HEICConverter {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
    }

    async pickAndConvert() {
        try {
            // Pick file
            const file = await DocumentPicker.pick({
                type: DocumentPicker.types.images,
            });

            // Check if it's a HEIC file
            if (!file.name.toLowerCase().endsWith('.heic')) {
                throw new Error('Please select a HEIC file');
            }

            // Convert
            const result = await this.convertFile(file, 'jpeg');
            
            if (result.status === 'success') {
                // Download converted file
                return await this.downloadFile(result.downloadUrl);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Conversion failed:', error);
            throw error;
        }
    }

    async convertFile(file, format = 'jpeg') {
        const formData = new FormData();
        formData.append('heicFile', {
            uri: file.uri,
            type: file.type,
            name: file.name,
        });
        formData.append('format', format);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return await response.json();
    }

    async downloadFile(downloadUrl) {
        const response = await fetch(`${this.baseUrl}${downloadUrl}`);
        return await response.blob();
    }
}

// Usage
const converter = new HEICConverter();
converter.pickAndConvert()
    .then(blob => console.log('Conversion successful', blob))
    .catch(error => console.error('Error:', error));
```

## 🔧 Error Handling Best Practices

```javascript
class HEICConverterAPI {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
    }

    async uploadWithRetry(file, format = 'jpeg', maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.upload(file, format);
                return result;
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw new Error(`Upload failed after ${maxRetries} attempts: ${error.message}`);
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    async upload(file, format) {
        const formData = new FormData();
        formData.append('heicFile', file);
        formData.append('format', format);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message);
        }

        return result;
    }
}
```

## 📊 Monitoring and Analytics

```javascript
class HEICConverterWithAnalytics extends HEICConverterAPI {
    constructor(baseUrl) {
        super(baseUrl);
        this.stats = {
            uploadsStarted: 0,
            uploadsCompleted: 0,
            uploadsFailed: 0,
            totalProcessingTime: 0,
        };
    }

    async upload(file, format) {
        const startTime = Date.now();
        this.stats.uploadsStarted++;

        try {
            const result = await super.upload(file, format);
            this.stats.uploadsCompleted++;
            this.stats.totalProcessingTime += Date.now() - startTime;
            
            console.log('Upload stats:', {
                ...this.stats,
                averageTime: this.stats.totalProcessingTime / this.stats.uploadsCompleted,
                successRate: (this.stats.uploadsCompleted / this.stats.uploadsStarted * 100).toFixed(2) + '%'
            });
            
            return result;
        } catch (error) {
            this.stats.uploadsFailed++;
            throw error;
        }
    }
}
```

## 🔐 Authentication Example (if you add auth)

```javascript
class AuthenticatedHEICConverter extends HEICConverterAPI {
    constructor(baseUrl, apiKey) {
        super(baseUrl);
        this.apiKey = apiKey;
    }

    async upload(file, format) {
        const formData = new FormData();
        formData.append('heicFile', file);
        formData.append('format', format);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                // Don't set Content-Type for FormData, let browser set it
            },
            body: formData,
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message);
        }

        return result;
    }
}
```