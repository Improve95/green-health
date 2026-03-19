# Backend API Endpoint Documentation

Base URL: `http://localhost:8080/api/v1`
WebSocket URL: `ws://localhost:8080/ws`

---

## REST Endpoints

### 1. Submit Photo Analysis

- **Method:** `POST`
- **Path:** `/analysis/photo`
- **Content-Type:** `application/json`
- **Description:** Submits one or more plant images for disease detection analysis.

**Request Body:**

```json
{
  "reportName": "string",
  "images": [
    {
      "data": "string (base64-encoded image)",
      "fileName": "string",
      "mimeType": "string (e.g. image/jpeg)",
      "settings": {
        "brightness": "number (0-200, default 100)",
        "contrast": "number (0-200, default 100)",
        "saturation": "number (0-200, default 100)"
      }
    }
  ]
}
```

**Response (`200 OK`):**

```json
{
  "reportId": "string (UUID)",
  "status": "analyzing | completed | error",
  "results": [
    {
      "fileName": "string",
      "diseases": [
        {
          "disease": "string",
          "probability": "number (0-100)",
          "symptoms": ["string"],
          "plantPart": "string"
        }
      ]
    }
  ]
}
```

---

### 2. Initialize Video Analysis

- **Method:** `POST`
- **Path:** `/analysis/video/init`
- **Content-Type:** `application/json`
- **Description:** Initializes a video analysis session. Returns an `analysisId` used for the subsequent WebSocket upload.

**Request Body:**

```json
{
  "videoDurationSeconds": "number | null",
  "desiredFrameRate": "number",
  "videoMimeType": "string (e.g. video/mp4)"
}
```

**Response (`200 OK`):**

```json
{
  "analysisId": "string (UUID)",
  "status": "initialized",
  "maxChunkSizeBytes": "number"
}
```

---

### 3. List Reports

- **Method:** `GET`
- **Path:** `/reports`
- **Description:** Retrieves a list of reports, optionally filtered by type and/or status.

**Query Parameters:**

| Parameter | Type   | Required | Values                          |
|-----------|--------|----------|---------------------------------|
| `type`    | string | No       | `photo`, `video`, `streaming`   |
| `status`  | string | No       | `analyzing`, `completed`, `error` |

**Response (`200 OK`):**

```json
{
  "reports": [
    {
      "reportId": "string (UUID)",
      "reportName": "string",
      "type": "photo | video | streaming",
      "status": "analyzing | completed | error",
      "createdAt": "string (ISO 8601)"
    }
  ]
}
```

---

### 4. Get Report Detail

- **Method:** `GET`
- **Path:** `/reports/:reportId`
- **Description:** Retrieves the full details of a specific report, including analysis results.

**Path Parameters:**

| Parameter  | Type   | Description       |
|------------|--------|-------------------|
| `reportId` | string | UUID of the report |

**Response (`200 OK`):**

```json
{
  "reportId": "string (UUID)",
  "reportName": "string",
  "type": "photo | video | streaming",
  "status": "analyzing | completed | error",
  "createdAt": "string (ISO 8601)",
  "photoResults": [
    {
      "fileName": "string",
      "diseases": [
        {
          "disease": "string",
          "probability": "number",
          "symptoms": ["string"],
          "plantPart": "string"
        }
      ]
    }
  ],
  "videoResults": [
    {
      "frameNumber": "number",
      "timestamp": "number",
      "diseases": [
        {
          "disease": "string",
          "probability": "number",
          "symptoms": ["string"],
          "plantPart": "string"
        }
      ]
    }
  ]
}
```

> Note: `photoResults` is present for `type: "photo"`, `videoResults` for `type: "video"`.

---

## WebSocket Endpoints

### 5. Video Analysis Upload

- **URL:** `ws://localhost:8080/ws/video-analysis/:analysisId`
- **Description:** Streams video data in binary chunks after initializing via the REST endpoint above.

**Flow:**

1. Client opens WebSocket connection with the `analysisId` from `POST /analysis/video/init`.
2. Client sends binary frames (ArrayBuffer chunks) up to `maxChunkSizeBytes`.
3. After all chunks are sent, client sends a JSON message: `{ "type": "upload_complete" }`.
4. Server responds with: `{ "type": "upload_acknowledged" }`.

---

## Configuration

| Setting               | Value                            | File               |
|-----------------------|----------------------------------|---------------------|
| `API_BASE_URL`        | `http://localhost:8080/api/v1`   | `src/config/api.ts` |
| `WS_BASE_URL`         | `ws://localhost:8080/ws`         | `src/config/api.ts` |
| `REPORT_POLL_INTERVAL`| `5000` ms                        | `src/config/api.ts` |
| `USE_REAL_BACKEND`    | `false` (stubs enabled)          | `src/config/api.ts` |
