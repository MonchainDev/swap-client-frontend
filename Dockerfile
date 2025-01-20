# Use an official Node.js base image with Alpine for a smaller image
# Use "build" stage to build the application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package*.json ./

# Install dependencies with clean install for a minimal setup
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a new lightweight base image for the production stage
FROM node:18-alpine as prod

# Set working directory
WORKDIR /app

# Copy built application from "build" stage
COPY --from=build /app/.output /app/.output


# Expose necessary port (optional, e.g., if your app runs on port 3000)
EXPOSE 3000

# Set the default command to run the application
CMD ["node", ".output/server/index.mjs"]
