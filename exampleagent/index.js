const express = require('express');
const app = express();

// Get port from environment variable or default to 4000
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    agent: 'simple-datetime-agent'
  });
});

// Main AI agent endpoint
app.get('/datetime', (req, res) => {
  try {
    // Get current date and time
    const now = new Date();
    
    // Format the date and time in a readable format
    const formattedDateTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    // Return the formatted response
    const response = `Hello! i am telling you it is ${formattedDateTime}`;
    
    res.json({
      message: response,
      timestamp: now.toISOString(),
      formatted: formattedDateTime
    });
  } catch (error) {
    console.error('Error generating datetime response:', error);
    res.status(500).json({
      error: 'Failed to get current date and time',
      timestamp: new Date().toISOString()
    });
  }
});

// Default endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Simple DateTime AI Agent',
    description: 'A simple AI agent that returns the current date and time',
    version: '1.0.0',
    endpoints: {
      '/': 'This information',
      '/health': 'Health check',
      '/datetime': 'Get current date and time with greeting'
    },
    usage: 'GET /datetime to get the current date and time'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/', '/health', '/datetime'],
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🤖 Simple DateTime AI Agent is running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🕐 DateTime API: http://localhost:${PORT}/datetime`);
  console.log(`📚 API Info: http://localhost:${PORT}/`);
}); 