# API Загрузки файлов 


## Запуск сервера

1. Установите Node.js https://nodejs.org/en
2. Проверьте установку, выполнив в командной строке/терминале:
```bash
    npm -v
    node -v
```
Если выдает ошибку, попробуйте:
```bash
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Установите зависимости:
```bash
   npm init -y
   npm install express multer cors
```
4. Запустите сервер:
- Перейдите в директорию где лежит файл server.js
```bash
   cd C:\путь_к_вашей_папке\FileTransfer-main
```
- Запуск сервера
```bash
   node server.js
```
```
Server running on http://localhost:3000
```
## Base URLs

- **Desktop development**: `http://localhost:3000`
- **Mobile development**: `http://10.0.0.2:3000`

## API Endpoint

## Request

### Headers
- `Content-Type`: `multipart/form-data`

### Parameters (form-data)

| Name          | Type      | Required | Default | Description               |
|---------------|-----------|----------|---------|---------------------------|
| `file`        | file      | Yes      | -       | File to upload            |
| `expires`     | integer   | No       | 7       | Days until link expires   |
| `maxDownloads`| integer   | No       | 1       | Maximum allowed downloads |

## Response

### Success (200 OK)

```json
{
  "success": true,
  "link": "http://example.com/download/abc123",
  "filename": "document.pdf",
  "expires": "2023-12-31T23:59:59Z",
  "maxDownloads": 5,
  "message": "File uploaded successfully"
}
```
