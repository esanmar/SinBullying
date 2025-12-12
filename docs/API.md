# API Documentation

Complete reference for SinBullying API endpoints.

## Base URL

```
https://your-app.vercel.app/api
```

## Authentication

Most endpoints require authentication via email-based sessions. Include the user's email in requests where authentication is needed.

### Headers
```
Content-Type: application/json
X-User-Email: user@example.com
```

## Endpoints

### Cases

#### Create Case
```http
POST /api/casos
```

**Request Body:**
```json
{
  "descripcion": "Description of the incident",
  "gravedad": "alta",
  "anonimo": false,
  "email_reportante": "student@school.edu",
  "nombre_reportante": "John Doe",
  "archivos_urls": [
    "https://blob.vercel-storage.com/file1.jpg",
    "https://blob.vercel-storage.com/file2.mp4"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "caseId": 123,
  "message": "Caso creado exitosamente"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Validation error
- `429` - Rate limit exceeded
- `500` - Server error

---

#### List Cases
```http
GET /api/casos
```

**Query Parameters:**
- `estado` (optional): Filter by status (pendiente, en_proceso, resuelto)
- `gravedad` (optional): Filter by severity (baja, media, alta)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "casos": [
    {
      "id": 123,
      "descripcion": "...",
      "gravedad": "alta",
      "fecha": "2025-12-12T08:30:00Z",
      "estado": "pendiente",
      "anonimo": false,
      "tecnico_asignado": "tech@school.edu"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

#### Get Case Details
```http
GET /api/casos/:id
```

**Response:**
```json
{
  "id": 123,
  "descripcion": "Detailed description...",
  "gravedad": "alta",
  "fecha": "2025-12-12T08:30:00Z",
  "estado": "en_proceso",
  "anonimo": false,
  "email_reportante": "student@school.edu",
  "nombre_reportante": "John Doe",
  "tecnico_asignado": "tech@school.edu",
  "notas_tecnico": "Investigation in progress",
  "archivos_urls": [
    "https://blob.vercel-storage.com/file1.jpg"
  ]
}
```

---

#### Update Case
```http
PUT /api/casos/:id
```

**Request Body:**
```json
{
  "estado": "resuelto",
  "notas_tecnico": "Case resolved after intervention"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Caso actualizado exitosamente"
}
```

---

#### Delete Case
```http
DELETE /api/casos/:id
```

**Authorization:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Caso eliminado exitosamente"
}
```

---

#### Assign Technician
```http
POST /api/casos/:id/assign
```

**Request Body:**
```json
{
  "tecnico_email": "tech@school.edu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Técnico asignado exitosamente"
}
```

---

### Files

#### Upload File
```http
POST /api/upload
```

**Request:** Multipart form data
- `file`: File to upload (max 10MB)

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/abc123.jpg",
  "pathname": "abc123.jpg",
  "contentType": "image/jpeg",
  "size": 1024000
}
```

**Allowed file types:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM
- Documents: PDF

---

### Setup

#### Initialize Database
```http
GET /api/setup
```

**Description:** Creates required database tables. Should only be run once after deployment.

**Response:**
```json
{
  "message": "Tablas creadas correctamente"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

Rate limits are applied per IP address:

- Public endpoints: 10 requests/minute
- Authenticated endpoints: 60 requests/minute
- File uploads: 5 requests/minute

When rate limited, you'll receive a `429` status with:

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Webhooks (Future)

Webhook support for external integrations is planned for future releases.
