File Upload API Documentation
This API allows clients to upload files and receive a shareable link with customizable expiration and download limits.

API Endpoints
Desktop/Local Development: http://localhost:3000/api/upload

Android/Network Access: http://10.0.0.2:3000/api/upload

Request Specification
Method
POST

Headers
Content-Type: multipart/form-data

Form Data Parameters
Parameter	Type	Required	Description
file	file	Yes	The file to be uploaded
expires	integer	No	Expiration time in hours (default: 24)
maxDownloads	integer	No	Maximum download attempts (default: 10)
Response Specification
Success Response (200 OK)
json
{
  "success": true,
  "link": "http://example.com/download/abc123",
  "filename": "example.pdf",
  "expires": "2023-12-31T23:59:59Z",
  "maxDownloads": 10,
  "message": "File uploaded successfully"
}
Error Responses
400 Bad Request (Missing file or invalid parameters)

413 Payload Too Large (File size exceeds limit)

500 Internal Server Error (Server processing error)

Example Usage
cURL Example
bash
curl -X POST \
  http://10.0.0.2:3000/api/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/file.pdf' \
  -F 'expires=48' \
  -F 'maxDownloads=5'
JavaScript Fetch Example
javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('expires', '24');
formData.append('maxDownloads', '10');

fetch('http://10.0.0.2:3000/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
Rate Limits
Maximum file size: 100MB

Requests per minute: 60

Security
All uploads are scanned for malware

Links become invalid after expiration or download limit reached

HTTPS encryption recommended for production use

Version
Current API version: 1.0.0
