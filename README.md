# FM4 Program Key Discovery Server

A standalone service that automatically discovers and catalogs all FM4 radio program keys by continuously monitoring the FM4 API endpoints.

## 📋 Overview

This server scrapes FM4's live and broadcasts API endpoints to discover and maintain a comprehensive database of all program keys, along with their titles, subtitles, and descriptions. The service runs continuously, updating the database in real-time as new programs are broadcast.

## 🚀 Features

- **Automatic Discovery**: Continuously scrapes FM4 API endpoints to discover program keys
- **Smart Updates**: Uses upsert logic to avoid duplicates and update existing entries
- **Real-time Tracking**: Monitors when each program key was first and last seen
- **RESTful API**: Simple HTTP API to retrieve all discovered program keys
- **Swagger Documentation**: Interactive API documentation at `/api-docs`
- **Statistics**: Track total keys, recent activity, and last update times

## 📊 Scraping Schedule

- **Live Endpoint**: Every 1 minute
- **Broadcasts Endpoint**: Every 5 minutes

## 🛠️ Installation

```bash
cd key-server
npm install
```

## ⚙️ Configuration

Configuration is managed through environment variables in the `.env` file:

```env
PORT=3001                                              # Server port
NODE_ENV=production                                    # Environment mode
DATABASE_PATH=./data/keys.db                          # SQLite database location
FM4_API_BASE_URL=https://audioapi.orf.at/fm4/json/4.0 # FM4 API base URL
```

## 🏃 Running the Server

### Start the server
```bash
npm start
```

### Development mode (with auto-reload)
```bash
npm run dev
```

### Initialize database (optional)
```bash
npm run init-db
```

The server will automatically:
1. Initialize the database if it doesn't exist
2. Start scraping immediately
3. Continue scraping on the configured schedule

## 📡 API Endpoints

### Root
```
GET /
```
Redirects to `/api/program-keys`

### Get All Program Keys
```
GET /api/program-keys
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "program_key": "4HB",
      "description": "Homebase",
      "title": "Homebase",
      "subtitle": "mit Christina Pausackl",
      "first_seen": 1699459200,
      "last_seen": 1699545600,
      "updated_at": 1699545600
    }
  ]
}
```

### Get Specific Program Key
```
GET /api/program-keys/:programKey
```

**Example:**
```
GET /api/program-keys/4HB
```

**Response:**
```json
{
  "success": true,
  "data": {
    "program_key": "4HB",
    "description": "Homebase",
    "title": "Homebase",
    "subtitle": "mit Christina Pausackl",
    "first_seen": 1699459200,
    "last_seen": 1699545600,
    "updated_at": 1699545600
  }
}
```

### Get Statistics
```
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalKeys": 42,
    "recentKeys": 15,
    "lastUpdate": 1699545600
  }
}
```

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00.000Z",
  "uptime": 3600
}
```

### API Documentation
```
GET /api-docs
```
Interactive Swagger/OpenAPI documentation interface.

## 📂 Database Schema

**Table: `program_keys`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `program_key` | TEXT | Unique program identifier (e.g., "4HB") |
| `description` | TEXT | Program description/name |
| `title` | TEXT | Broadcast title |
| `subtitle` | TEXT | Broadcast subtitle |
| `first_seen` | INTEGER | Unix timestamp when first discovered |
| `last_seen` | INTEGER | Unix timestamp when last seen |
| `updated_at` | INTEGER | Unix timestamp of last update |

**Indexes:**
- `idx_program_key` - Fast lookups by program key
- `idx_last_seen` - Efficient sorting by last seen time

## 🔄 How It Works

1. **Initial Scrape**: On startup, immediately scrapes both live and broadcasts endpoints
2. **Live Monitoring**: Checks the `/live` endpoint every minute for currently broadcasting programs
3. **Broadcasts Scan**: Checks the `/broadcasts` endpoint every 5 minutes for all available programs
4. **Smart Updates**: 
   - New program keys are inserted with current timestamp as `first_seen`
   - Existing keys are updated with new data (if provided) and current timestamp as `last_seen`
   - Uses SQLite's `UPSERT` (INSERT ... ON CONFLICT) for atomic operations

## 🗂️ Project Structure

```
key-server/
├── src/
│   ├── config/
│   │   ├── config.js      # Configuration management
│   │   └── swagger.js     # Swagger/OpenAPI specification
│   ├── database/
│   │   ├── database.js    # Database service
│   │   └── schema.js      # Database schema definition
│   ├── routes/
│   │   └── api.js         # API route handlers
│   ├── scripts/
│   │   └── init-database.js  # Database initialization script
│   ├── services/
│   │   ├── fm4-api.js     # FM4 API client
│   │   └── scraper.js     # Scraping service
│   └── server.js          # Main application entry point
├── data/
│   └── keys.db            # SQLite database (auto-created)
├── .env                   # Environment configuration
├── package.json
└── README.md
```

## 🔍 Data Fields Explained

- **program_key**: The unique identifier for each FM4 program (e.g., "4HB", "4LB", "4HH")
- **description**: Usually the program name (e.g., "Homebase", "Last but not Beast")
- **title**: The specific broadcast title
- **subtitle**: Additional broadcast information (e.g., presenter name)
- **first_seen**: Timestamp when this program key was first discovered
- **last_seen**: Timestamp when this program key was most recently seen in the API
- **updated_at**: Timestamp of the last database update for this entry

## 🛡️ Error Handling

The scraper is designed to be resilient:
- API errors are logged but don't stop the service
- Failed scrapes are retried on the next interval
- Database errors are caught and logged
- Graceful shutdown on SIGINT/SIGTERM signals

## 📈 Monitoring

Check the console output for real-time scraping activity:
```
[Scraper] Starting program key scraper...
[Scraper] - Live endpoint: every 1 minute
[Scraper] - Broadcasts endpoint: every 5 minutes
[API] Fetching live data from: https://audioapi.orf.at/fm4/json/4.0/live
[Scraper] Live scrape complete. Found 3 program keys.
[API] Fetching broadcasts from: https://audioapi.orf.at/fm4/json/4.0/broadcasts
[Scraper] Broadcasts scrape complete. Found 28 program keys.
```

## 🔧 Technical Details

- **Node.js**: >= 24.0.0
- **Database**: SQLite3 with WAL mode for better concurrency
- **Framework**: Express.js 5.x
- **API Style**: RESTful JSON API
- **Documentation**: OpenAPI 3.0 (Swagger)

## 🤝 Integration

This is a standalone service designed to be independent from the main FM4 backend. It can be:
- Run on the same server (different port)
- Deployed separately
- Queried by other services to get available program keys

## 📝 License

MIT

## 🆘 Support

The server provides several endpoints for health monitoring:
- `/health` - Server health status
- `/api/stats` - Database statistics
- Console logs for scraping activity

---

**Note**: This service continuously monitors the FM4 API. Ensure you have appropriate network access and respect the API's terms of use.
