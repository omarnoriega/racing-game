#!/bin/bash

# Desplegar con Canary Release (Traffic Splitting)

set -e

# Configuración
RESOURCE_GROUP="racing-game-rg"
APP_NAME="racing-game-frontend"
ACR_NAME="racinggamecr"  
# Percentages (deben sumar 100)
STABLE_TRAFFIC=80  # % para versión TAP (stable)
CANARY_TRAFFIC=20  # % para versión MOTION (canary)

echo "🎯 Deploying Canary Release..."
echo "   Stable (TAP): ${STABLE_TRAFFIC}%"
echo "   Canary (MOTION): ${CANARY_TRAFFIC}%"

# Obtener la revisión actual (stable)
CURRENT_REVISION=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?properties.trafficWeight==100].name" \
  --output tsv | head -n 1)

if [ -z "$CURRENT_REVISION" ]; then
  echo "⚠️  No stable revision found, using latest active revision"
  CURRENT_REVISION=$(az containerapp revision list \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "[?properties.active==\`true\`].name" \
    --output tsv | head -n 1)
fi

echo "📦 Current stable revision: $CURRENT_REVISION"

# Crear nueva revisión con imagen MOTION
echo "🚀 Creating canary revision with MOTION version..."
az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/racing-game-frontend:motion-latest \
  --revision-suffix "motion-$(date +%Y%m%d-%H%M%S)"

# Obtener nombre de la nueva revisión
NEW_REVISION=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[0].name" \
  --output tsv)

echo "📦 New canary revision: $NEW_REVISION"

# Configurar traffic splitting
echo "🔀 Configuring traffic split..."
az containerapp ingress traffic set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision-weight ${CURRENT_REVISION}=${STABLE_TRAFFIC} ${NEW_REVISION}=${CANARY_TRAFFIC}

echo ""
echo "✅ Canary deployment complete!"
echo ""
echo "📊 Traffic Distribution:"
echo "   ${STABLE_TRAFFIC}% → $CURRENT_REVISION (TAP - Stable)"
echo "   ${CANARY_TRAFFIC}% → $NEW_REVISION (MOTION - Canary)"
echo ""
echo "🔍 Monitor metrics and adjust traffic as needed"