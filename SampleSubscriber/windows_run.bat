@echo off

echo Starting Docker containers...
docker-compose up -d

npm install

npm start
