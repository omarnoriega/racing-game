#!/bin/bash
SUBSCRIPTION_ID="556b812f-3bdd-4e65-bdbc-c982a185ce9b" 
RESOURCE_GROUP="racing-game-rg"
LOCATION="westus2"
ACR_NAME="racinggamecr"  # TODO: Nombre único del ACR (solo letras y números)
ENVIRONMENT_NAME="racing-game-env"
BACKEND_APP="racing-game-backend"
FRONTEND_APP_NAME="racing-game-frontend"
# ============================================

BACKEND_URL="https://racing-game-backend.gentleisland-51245d58.westus2.azurecontainerapps.io"
FRONTEND_URL="https://racing-game-frontend.gentleisland-51245d58.westus2.azurecontainerapps.io"


echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"



# Actualizar Backend con CORS correcto
echo "🔧 Actualizando Backend..."
az containerapp update \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    NODE_ENV=development \
    PORT=3001 \
    CORS_ORIGIN="https://$FRONTEND_URL" \
    JWT_SECRET="$JWT_SECRET"

echo "✅ Backend actualizado"

# IMPORTANTE: Rebuild del frontend con las URLs correctas
echo ""
echo "⚠️  IMPORTANTE: Debes hacer rebuild del frontend con:"
echo "REACT_APP_API_URL=https://$BACKEND_URL"
echo "REACT_APP_WS_URL=https://$BACKEND_URL"