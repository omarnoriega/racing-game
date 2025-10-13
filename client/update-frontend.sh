# Obtener URLs de Azure
BACKEND_URL="https://racing-game-backend.gentleisland-51245d58.westus2.azurecontainerapps.io"
FRONTEND_URL="https://racing-game-frontend.gentleisland-51245d58.westus2.azurecontainerapps.io"

# Rebuild frontend con las URLs correctas

docker build \
  --build-arg REACT_APP_API_URL="https://$BACKEND_URL" \
  --build-arg REACT_APP_WS_URL="https://$BACKEND_URL" \
  -t racinggamecr.azurecr.io/racing-game-frontend:latest \
  .

# Push a ACR
az acr login --name racinggamecr --expose-token
docker push racinggamecr.azurecr.io/racing-game-frontend:latest

# Forzar redeploy
az containerapp update \
  --name racing-game-frontend \
  --resource-group racing-game-rg \
  --image racinggamecr.azurecr.io/racing-game-frontend:latest