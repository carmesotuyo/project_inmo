#!/bin/bash

echo "Starting Docker containers..."
docker-compose up -d

echo "Installing npm dependencies..."
npm install

echo "Building and running sensor simulator..."
npm start
