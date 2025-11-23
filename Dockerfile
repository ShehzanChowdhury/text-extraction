# Use the official Node.js runtime as a base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variable
ENV PORT=8080

# Run the application
CMD ["node", "server.js"]


