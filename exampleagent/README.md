# Simple DateTime AI Agent

A basic Node.js AI agent that returns the current date and time with a friendly greeting via REST API.

## 🎯 What This Agent Does

This agent provides a simple API that returns the current date and time prefixed with "Hello! i am telling you it is". It's designed as an example for the AI Agent Platform.

## 🚀 API Endpoints

### Main Endpoint
- **GET** `/datetime` - Returns current date and time with greeting

**Example Response:**
```json
{
  "message": "Hello! i am telling you it is Monday, January 27, 2025 at 12:43:25 PM EST",
  "timestamp": "2025-01-27T17:43:25.123Z",
  "formatted": "Monday, January 27, 2025 at 12:43:25 PM EST"
}
```

### Other Endpoints
- **GET** `/` - Agent information and available endpoints
- **GET** `/health` - Health check for monitoring

## 🛠 Local Development

### Prerequisites
- Node.js 18 or higher
- npm

### Installation
```bash
# Install dependencies
npm install

# Start the server
npm start
```

The agent will be available at `http://localhost:3000`

### Testing the Agent
```bash
# Get current date and time
curl http://localhost:3000/datetime

# Check health
curl http://localhost:3000/health

# Get agent info
curl http://localhost:3000/
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t simple-datetime-agent .
```

### Run Container
```bash
docker run -p 3000:3000 simple-datetime-agent
```

### Using Docker Compose
```yaml
version: '3.8'
services:
  datetime-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 📋 Environment Variables

- `PORT` - Port to run the server on (default: 3000)

## 🔧 Agent Configuration

This agent is configured for the AI Agent Platform with:

- **Runtime**: Node.js
- **Category**: Utilities
- **Main File**: `index.js`
- **Dependencies**: `package.json`
- **Container**: `Dockerfile`

## 📝 Example Usage in AI Agent Platform

1. **Upload this agent** using the platform's drag-and-drop interface
2. **Select files**: `index.js`, `package.json`, `Dockerfile`, `README.md`
3. **Configure**:
   - Name: "Simple DateTime Agent"
   - Runtime: Node.js
   - Category: Utilities
   - Description: "Returns current date and time with greeting"
4. **Deploy** and access via the provided URL

## 🎨 Extending This Agent

This basic agent can be extended to:
- Accept timezone parameters
- Format dates in different locales
- Add more complex time calculations
- Include weather data or other contextual information
- Support POST requests with custom formatting options

## 📄 License

MIT License - Feel free to use this as a template for your own agents! 