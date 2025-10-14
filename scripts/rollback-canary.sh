#!/bin/bash

# Rollback: 100% del tráfico a stable

RESOURCE_GROUP="racing-game-rg"
APP_NAME="racing-game-frontend"

echo "⚠️  ROLLBACK: Routing 100% traffic to stable version"

STABLE_REVISION=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'tap')].name" \
  --output tsv | head -n 1)

az containerapp ingress traffic set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision-weight ${STABLE_REVISION}=100

echo "✅ Rollback complete. All traffic now on stable version."