#!/bin/bash

git push origin main

ssh 103.157.26.67 << 'ENDSSH'

# Navigate to the project directory
cd /home/app/rubarta-erp-client

# Pull the latest changes
git pull origin main

# Install dependencies
npm install

# Build the project
npm run generate

# Restart the service
# pm2 restart erp

ENDSSH
