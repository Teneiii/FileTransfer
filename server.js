const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Создаем папки, если их нет
const uploadDir = path.join(__dirname, 'uploads');
const dbFilePath = path.join(__dirname, 'fileDatabase.json');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Инициализация "базы данных"
let fileDatabase = {};

try {
  if (fs.existsSync(dbFilePath)) {
    fileDatabase = JSON.parse(fs.readFileSync(dbFilePath));
  }
} catch (err) {
  console.error('Error reading database file:', err);
}

// Конфигурация Multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Сохранение базы данных в файл
function saveDatabase() {
  fs.writeFileSync(dbFilePath, JSON.stringify(fileDatabase, null, 2));
}

// API Endpoints
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const { expires = '7d', maxDownloads = '1' } = req.body;
  const expiresMs = convertToMilliseconds(expires);

  const fileData = {
    originalName: req.file.originalname,
    path: req.file.path,
    downloadCount: 0,
    maxDownloads: parseInt(maxDownloads),
    expiresAt: expires === 'never' ? null : Date.now() + expiresMs,
    createdAt: Date.now()
  };

  fileDatabase[req.file.filename] = fileData;
  saveDatabase();

  const fileUrl = `${req.protocol}://${req.get('host')}/download/${req.file.filename}`;
  
  res.json({
    success: true,
    link: fileUrl,
    filename: req.file.originalname,
    expires: expires,
    maxDownloads: maxDownloads,
    message: 'File uploaded successfully'
  });
});

app.get('/download/:filename', (req, res) => {
  const fileData = fileDatabase[req.params.filename];
  
  if (!fileData) {
    return res.status(404).send('File not found or expired');
  }

  // Проверка срока действия
  if (fileData.expiresAt && Date.now() > fileData.expiresAt) {
    deleteFile(req.params.filename);
    return res.status(410).send('File expired');
  }

  // Сначала отправляем файл, потом обновляем счетчик
  res.download(fileData.path, fileData.originalName, (err) => {
    if (err) {
      console.error('Download error:', err);
      return;
    }

    // Только после успешной отправки обновляем счетчик
    fileData.downloadCount++;
    
    if (fileData.downloadCount >= fileData.maxDownloads) {
      // Запланировать удаление через 1 минуту (на случай если скачивание прервется)
      setTimeout(() => deleteFile(req.params.filename), 5000);
    } else {
      fileDatabase[req.params.filename] = fileData;
      saveDatabase();
    }
  });
});

app.get('/api/files', (req, res) => {
  const files = Object.entries(fileDatabase).map(([filename, data]) => ({
    name: filename,
    originalName: data.originalName,
    url: `${req.protocol}://${req.get('host')}/download/${filename}`,
    size: fs.existsSync(data.path) ? fs.statSync(data.path).size : 0,
    downloadCount: data.downloadCount,
    maxDownloads: data.maxDownloads,
    expiresAt: data.expiresAt,
    uploaded: data.createdAt
  }));

  res.json(files);
});

app.delete('/api/files/:filename', (req, res) => {
  if (deleteFile(req.params.filename)) {
    res.json({ success: true, message: 'File deleted successfully' });
  } else {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

function deleteFile(filename) {
  const fileData = fileDatabase[filename];
  if (!fileData) return false;

  try {
    if (fs.existsSync(fileData.path)) {
      fs.unlinkSync(fileData.path);
    }
    delete fileDatabase[filename];
    saveDatabase();
    return true;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
}

function convertToMilliseconds(timeString) {
  if (timeString === 'never') return null;
  
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1));
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000; // 7 дней по умолчанию
  }
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Очистка просроченных файлов каждые 60 минут
  setInterval(() => {
    const now = Date.now();
    Object.keys(fileDatabase).forEach(filename => {
      const fileData = fileDatabase[filename];
      if (fileData.expiresAt && now > fileData.expiresAt) {
        deleteFile(filename);
      }
    });
  }, 60 * 60 * 1000);
});