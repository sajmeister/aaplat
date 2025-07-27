# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = { hostname: 'localhost', port: 3000, path: '/health', timeout: 2000 };
    const req = http.request(options, (res) => { 
      if (res.statusCode === 200) process.exit(0); 
      else process.exit(1); 
    });
    req.on('error', () => process.exit(1));
    req.on('timeout', () => process.exit(1));
    req.end();
  "

# Start the application
CMD ["npm", "start"] 