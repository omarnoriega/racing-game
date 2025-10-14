#!/bin/bash

RESOURCE_GROUP="racing-game-rg"
BACKEND_APP="racing-game-backend"

# Obtener URLs del frontend
FRONTEND_TAP_URL=$(az containerapp revision list \
  --name racing-game-frontend \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'tap')].properties.fqdn | [0]" \
  --output tsv)

FRONTEND_MOTION_URL=$(az containerapp revision list \
  --name racing-game-frontend \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'motion')].properties.fqdn | [0]" \
  --output tsv)

# Si ambas comparten la misma URL (traffic splitting)
FRONTEND_MAIN_URL=$(az containerapp show \
  --name racing-game-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "Frontend URLs detected:"
echo "  Main: https://$FRONTEND_MAIN_URL"
echo "  TAP: https://$FRONTEND_TAP_URL"
echo "  MOTION: https://$FRONTEND_MOTION_URL"

# Crear lista de CORS_ORIGIN
CORS_LIST="https://$FRONTEND_MAIN_URL"

if [ ! -z "$FRONTEND_TAP_URL" ] && [ "$FRONTEND_TAP_URL" != "$FRONTEND_MAIN_URL" ]; then
  CORS_LIST="$CORS_LIST,https://$FRONTEND_TAP_URL"
fi

if [ ! -z "$FRONTEND_MOTION_URL" ] && [ "$FRONTEND_MOTION_URL" != "$FRONTEND_MAIN_URL" ]; then
  CORS_LIST="$CORS_LIST,https://$FRONTEND_MOTION_URL"
fi

echo ""
echo "Updating backend CORS_ORIGIN to: $CORS_LIST"

# Actualizar backend
az containerapp update \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars CORS_ORIGIN="$CORS_LIST"

echo "✅ Backend updated with CORS configuration"