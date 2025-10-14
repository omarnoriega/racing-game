#!/bin/bash

# Build ambas versiones del frontend

set -e

ACR_NAME="racinggamecr"  
BACKEND_URL="https://racing-game-backend.gentleisland-51245d58.westus2.azurecontainerapps.io"  

echo "🏗️  Building TAP version..."
docker build \
  -f client/Dockerfile.tap \
  --build-arg REACT_APP_API_URL="https://$BACKEND_URL" \
  --build-arg REACT_APP_WS_URL="https://$BACKEND_URL" \
  -t $ACR_NAME.azurecr.io/racing-game-frontend:tap-canary-latest \
  -t $ACR_NAME.azurecr.io/racing-game-frontend:tap-$(date +%Y%m%d-%H%M%S) \
  ./client

echo "🏗️  Building MOTION version..."
docker build \
  -f client/Dockerfile.motion \
  --build-arg REACT_APP_API_URL="https://$BACKEND_URL" \
  --build-arg REACT_APP_WS_URL="https://$BACKEND_URL" \
  -t $ACR_NAME.azurecr.io/racing-game-frontend:motion-latest \
  -t $ACR_NAME.azurecr.io/racing-game-frontend:motion-$(date +%Y%m%d-%H%M%S) \
  ./client

echo "📤 Pushing to ACR..."
az acr login --name $ACR_NAME

docker push $ACR_NAME.azurecr.io/racing-game-frontend:tap-canary-latest
docker push $ACR_NAME.azurecr.io/racing-game-frontend:motion-latest

echo "✅ Both versions built and pushed successfully!"