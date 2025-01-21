#!/bin/bash

set -e

# Get the current Node.js version
NODE_VERSION=$(node -v 2>/dev/null)

# Check if Node.js is installed
if [ $? -ne 0 ]; then
  echo "Error: Node.js is not installed."
  exit 1
fi

# Extract the major version number
MAJOR_VERSION=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d'.' -f1)

# Compare the major version
if [ "$MAJOR_VERSION" -lt 20 ]; then
  echo "Warning: Your Node.js version ($NODE_VERSION) is less than 20.x.x. Please upgrade to avoid compatibility issues."
else
  echo "Your Node.js version ($NODE_VERSION) is sufficient."
fi

npm install -g dotenv-cli
npm install

echo "Stop docker compose"
docker compose down

dotenv \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c 'docker compose up -d'
#   -- docker compose up -d

# Indicate completion
echo "Docker compose started successfully."
