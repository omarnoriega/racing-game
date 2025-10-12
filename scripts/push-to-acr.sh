#!/bin/bash

# Push manual a ACR (para testing)

ACR_NAME="racinggamecr"  # TODO: Tu ACR name
TAG=${1:-latest}

echo "🔐 Login to ACR..."
az acr login --name $ACR_NAME

echo "🏗️  Building images..."
docker build -t $ACR_NAME.azurecr.io/racing-game-backend:$TAG ./server
docker build -t $ACR_NAME.azurecr.io/racing-game-frontend:$TAG \
  --build-arg REACT_APP_API_URL=https://your-backend-url \
  --build-arg REACT_APP_WS_URL=https://your-backend-url \
  ./client

echo "📤 Pushing to ACR..."
docker push $ACR_NAME.azurecr.io/racing-game-backend:$TAG
docker push $ACR_NAME.azurecr.io/racing-game-frontend:$TAG

echo "✅ Images pushed successfully!"