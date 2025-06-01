# API Загрузки файлов 


## Запуск сервера

1. Установите Node.js https://nodejs.org/en
2. Откройте PowerShell пишите следующие команды:
   1)```bash
    npm -v
    node -v```
Если выдает ошибку 
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
