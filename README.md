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
- Перейдите в директорию где лежит файл `server.js`
```bash
   cd C:\путь_к_вашей_папке\FileTransfer-main
```
- Запуск сервера
```bash
   node server.js
```
- Сообщение об успешном запуске сервера
```
Server running on http://localhost:3000
```
## Базовые URL

- **Для десктопной версии**: `http://localhost:3000`
- **Для мобильной версии**: `http://10.0.0.2:3000`

## API Endpoint

- **Конечная точка загрузки файла на сервер**: `http://10.0.0.2:3000`

## Request

### Headers
- `Content-Type`: `multipart/form-data`

### Параметры запроса (form-data)

| Имя           | Тип данных | Обязателен | Значение по умолчанию | Описание                  |
|---------------|------------|------------|-----------------------|---------------------------|
| `file`        | file       | Да         | -                     | Загружаемый файл          |
| `expires`     | integer    | Нет        | 7d                    | Срок хранения(min-минуты, h-часы, d-дни, w-недели) |
| `maxDownloads`| integer    | Нет        | 1                     | Максимальное количество загрузок |

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
