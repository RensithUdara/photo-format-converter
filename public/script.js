class HEICConverter {
    constructor() {
        this.files = new Map();
        this.uploadedCount = 0;
        this.convertedCount = 0;
        this.readyCount = 0;

        this.initializeElements();
        this.attachEventListeners();
        this.loadExistingFiles();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.formatSelect = document.getElementById('formatSelect');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.filesList = document.getElementById('filesList');
        this.convertAllBtn = document.getElementById('convertAllBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.statsSection = document.getElementById('statsSection');
        this.uploadedCountEl = document.getElementById('uploadedCount');
        this.convertedCountEl = document.getElementById('convertedCount');
        this.readyCountEl = document.getElementById('readyCount');
        this.notification = document.getElementById('notification');
    }

    attachEventListeners() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Action buttons
        this.convertAllBtn.addEventListener('click', this.convertAllFiles.bind(this));
        this.downloadAllBtn.addEventListener('click', this.downloadAllFiles.bind(this));
        this.clearAllBtn.addEventListener('click', this.clearAllFiles.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const heicFiles = files.filter(file =>
            file.name.toLowerCase().endsWith('.heic')
        );

        if (heicFiles.length === 0) {
            this.showNotification('Please select HEIC files only', 'error');
            return;
        }

        if (files.length > heicFiles.length) {
            this.showNotification(`${files.length - heicFiles.length} non-HEIC files were ignored`, 'info');
        }

        heicFiles.forEach(file => this.uploadFile(file));
    }

    async uploadFile(file) {
        const fileId = `${file.name}-${Date.now()}`;
        const fileData = {
            id: fileId,
            name: file.name,
            size: file.size,
            status: 'uploading',
            progress: 0
        };

        this.files.set(fileId, fileData);
        this.renderFileItem(fileData);
        this.updateStats();
        this.updateActionButtons();

        const formData = new FormData();
        formData.append('heicFile', file);
        formData.append('format', this.formatSelect.value);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                fileData.status = 'converted';
                fileData.convertedFile = result.convertedFile;
                fileData.downloadUrl = result.downloadUrl;
                this.convertedCount++;
                this.readyCount++;
                this.showNotification(`${file.name} converted successfully!`, 'success');
            } else {
                fileData.status = 'error';
                fileData.error = result.message;
                this.showNotification(`Error converting ${file.name}: ${result.message}`, 'error');
            }
        } catch (error) {
            fileData.status = 'error';
            fileData.error = error.message;
            this.showNotification(`Upload failed: ${error.message}`, 'error');
        }

        this.renderFileItem(fileData);
        this.updateStats();
        this.updateActionButtons();
    }

    renderFileItem(fileData) {
        const existingItem = document.getElementById(`file-${fileData.id}`);
        if (existingItem) {
            existingItem.remove();
        }

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.id = `file-${fileData.id}`;

        const statusIcon = this.getStatusIcon(fileData.status);
        const statusClass = `status-${fileData.status}`;
        const fileSize = this.formatFileSize(fileData.size);

        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-image file-icon"></i>
                <div class="file-details">
                    <h4>${fileData.name}</h4>
                    <p>${fileSize}</p>
                </div>
            </div>
            <div class="file-status ${statusClass}">
                ${statusIcon}
                <span>${this.getStatusText(fileData.status)}</span>
            </div>
            <div class="file-actions">
                ${this.getFileActions(fileData)}
            </div>
        `;

        this.filesList.appendChild(fileItem);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'uploading':
                return '<div class="loading"></div>';
            case 'converting':
                return '<div class="loading"></div>';
            case 'converted':
                return '<i class="fas fa-check-circle"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle"></i>';
            default:
                return '<i class="fas fa-clock"></i>';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'uploading':
                return 'Uploading...';
            case 'converting':
                return 'Converting...';
            case 'converted':
                return 'Ready';
            case 'error':
                return 'Error';
            default:
                return 'Pending';
        }
    }

    getFileActions(fileData) {
        if (fileData.status === 'converted') {
            return `
                <button class="btn btn-success btn-small" onclick="converter.downloadFile('${fileData.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-danger btn-small" onclick="converter.removeFile('${fileData.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        } else if (fileData.status === 'error') {
            return `
                <button class="btn btn-secondary btn-small" onclick="converter.retryFile('${fileData.id}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
                <button class="btn btn-danger btn-small" onclick="converter.removeFile('${fileData.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
        return `
            <button class="btn btn-danger btn-small" onclick="converter.removeFile('${fileData.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }

    downloadFile(fileId) {
        const fileData = this.files.get(fileId);
        if (fileData && fileData.downloadUrl) {
            const link = document.createElement('a');
            link.href = fileData.downloadUrl;
            link.download = fileData.convertedFile;
            link.click();
        }
    }

    removeFile(fileId) {
        this.files.delete(fileId);
        const fileItem = document.getElementById(`file-${fileId}`);
        if (fileItem) {
            fileItem.remove();
        }
        this.updateStats();
        this.updateActionButtons();
    }

    async retryFile(fileId) {
        const fileData = this.files.get(fileId);
        if (fileData) {
            // Reset status and retry upload
            fileData.status = 'uploading';
            delete fileData.error;
            this.renderFileItem(fileData);

            // You would need to re-upload the file here
            // For now, just show a message
            this.showNotification('Retry functionality would re-upload the file', 'info');
        }
    }

    async convertAllFiles() {
        try {
            const response = await fetch(`/convert-all?format=${this.formatSelect.value}`);
            const result = await response.json();

            if (result.status === 'success') {
                this.showNotification('All files converted successfully!', 'success');
                this.loadExistingFiles();
            } else {
                this.showNotification('Error converting files', 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async downloadAllFiles() {
        try {
            const response = await fetch('/converted-files');
            const result = await response.json();

            if (result.files && result.files.length > 0) {
                result.files.forEach(file => {
                    const link = document.createElement('a');
                    link.href = file.downloadUrl;
                    link.download = file.name;
                    link.click();
                });
                this.showNotification(`Downloading ${result.files.length} files...`, 'success');
            } else {
                this.showNotification('No files available for download', 'info');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async clearAllFiles() {
        if (confirm('Are you sure you want to clear all files? This will delete all uploaded and converted files.')) {
            try {
                const response = await fetch('/clear', { method: 'DELETE' });
                const result = await response.json();

                if (result.status === 'success') {
                    this.files.clear();
                    this.filesList.innerHTML = '';
                    this.uploadedCount = 0;
                    this.convertedCount = 0;
                    this.readyCount = 0;
                    this.updateStats();
                    this.updateActionButtons();
                    this.showNotification('All files cleared successfully!', 'success');
                }
            } catch (error) {
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        }
    }

    async loadExistingFiles() {
        try {
            const response = await fetch('/converted-files');
            const result = await response.json();

            if (result.files && result.files.length > 0) {
                result.files.forEach(file => {
                    const fileId = `existing-${file.name}-${Date.now()}`;
                    const fileData = {
                        id: fileId,
                        name: file.name.replace(/\.(jpeg|jpg|png)$/i, '.heic'),
                        size: 0,
                        status: 'converted',
                        convertedFile: file.name,
                        downloadUrl: file.downloadUrl
                    };
                    this.files.set(fileId, fileData);
                    this.renderFileItem(fileData);
                });

                this.readyCount = result.files.length;
                this.convertedCount = result.files.length;
                this.updateStats();
                this.updateActionButtons();
            }
        } catch (error) {
            console.error('Error loading existing files:', error);
        }
    }

    updateStats() {
        this.uploadedCountEl.textContent = this.files.size;
        this.convertedCountEl.textContent = this.convertedCount;
        this.readyCountEl.textContent = this.readyCount;

        if (this.files.size > 0) {
            this.statsSection.style.display = 'flex';
        } else {
            this.statsSection.style.display = 'none';
        }
    }

    updateActionButtons() {
        const hasFiles = this.files.size > 0;
        const hasConvertedFiles = this.readyCount > 0;

        this.convertAllBtn.style.display = hasFiles ? 'inline-flex' : 'none';
        this.downloadAllBtn.style.display = hasConvertedFiles ? 'inline-flex' : 'none';
        this.clearAllBtn.style.display = hasFiles ? 'inline-flex' : 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.add('show');

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 4000);
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new HEICConverter();
});