api
localhost:3000/api/upload for desktop
10.0.0.2:3000/api/upload for android

request params: form-data (file, expires, maxDownloads)
response: json
{
  success,
  link,
  filename,
  expires,
  maxDownloads,
  message
}
