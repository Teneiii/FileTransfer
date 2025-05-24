document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileList = document.getElementById('fileList');
    const notification = document.getElementById('notification');
    const expiresSelect = document.getElementById('expires');
    const maxDownloadsInput = document.getElementById('maxDownloads');
    
    let selectedFile = null;
    
    // Инициализация
    fetchFiles();
    
    // Обработчики событий
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('highlight');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('highlight');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
    
    uploadBtn.addEventListener('click', uploadFile);
    
    function handleFileSelection(file) {
        selectedFile = file;
        fileName.textContent = file.name;
        fileInfo.classList.remove('hidden');
    }
    
    function uploadFile() {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('expires', expiresSelect.value);
        formData.append('maxDownloads', maxDownloadsInput.value);
        
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('File uploaded successfully!', 'success');
                resetFileSelection();
                fetchFiles();
                
                // Копирование ссылки в буфер обмена
                if (data.link) {
                    copyToClipboard(data.link);
                }
            } else {
                showNotification(data.error || 'Upload failed', 'error');
            }
        })
        .catch(error => {
            showNotification('Error uploading file', 'error');
            console.error('Error:', error);
        });
    }
    
    function fetchFiles() {
        fetch('/api/files')
        .then(response => response.json())
        .then(files => {
            if (files.error) {
                fileList.innerHTML = `<p class="empty-message">${files.error}</p>`;
                return;
            }
            
            if (files.length === 0) {
                fileList.innerHTML = '<p class="empty-message">No files available</p>';
                return;
            }
            
            fileList.innerHTML = files.map(file => `
                <div class="file-item">
                    <div>
                        <a href="${file.url}" class="file-name" download>${file.name}</a>
                        <div class="file-meta">
                            <span class="expires" title="Expiration">
                                <i class="fas fa-clock"></i> ${formatExpiration(file.expiresAt)}
                            </span>
                            <span class="downloads" title="Downloads">
                                <i class="fas fa-download"></i> ${file.downloadCount}/${file.maxDownloads}
                            </span>
                            <span class="size">${formatFileSize(file.size)}</span>
                            <span class="date">${new Date(file.uploaded).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button onclick="copyToClipboard('${file.url}')" title="Copy link">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="deleteFile('${file.name}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error fetching files:', error);
            fileList.innerHTML = '<p class="empty-message">Error loading files</p>';
        });
    }
    
    function resetFileSelection() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
    }
    
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatExpiration(expiresAt) {
        if (!expiresAt) return 'Never';
        
        const now = new Date();
        const expirationDate = new Date(expiresAt);
        const diffMs = expirationDate - now;
        
        if (diffMs <= 0) return 'Expired';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
        if (diffHours > 0) return `${diffHours}h left`;
        
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffMins}m left`;
    }
});

// Глобальные функции
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            const notification = document.getElementById('notification');
            notification.textContent = 'Link copied to clipboard!';
            notification.className = 'notification success';
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
}

function deleteFile(filename) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('script').dispatchEvent(new Event('DOMContentLoaded'));
            showNotification('File deleted successfully', 'success');
        } else {
            showNotification(data.error || 'Failed to delete file', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}