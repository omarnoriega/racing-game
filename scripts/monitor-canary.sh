#!/bin/bash

# Monitorear métricas de ambas revisiones

RESOURCE_GROUP="racing-game-rg"
APP_NAME="racing-game-frontend"

echo "📊 Monitoring Canary Release..."
echo ""

# Obtener revisiones activas
echo "Active Revisions:"
az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?properties.active==\`true\`].{Name:name, Traffic:properties.trafficWeight, Replicas:properties.replicas, Health:properties.healthState}" \
  --output table

echo ""
echo "📈 Traffic Distribution:"
az containerapp ingress traffic show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table

echo ""
echo "🔍 Recent Logs (Tap):"
CANARY_REV=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, '000')].name | [0]" \
  --output tsv)

az containerapp logs show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision $CANARY_REV \
  --tail 20


echo "🔍 Recent Logs (Canary):"
CANARY_REV=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'motion')].name | [0]" \
  --output tsv)


az containerapp logs show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision $CANARY_REV \
  --tail 20

echo ""
echo "💡 Commands:"
echo "  Increase canary: ./scripts/increase-canary-traffic.sh"
echo "  Rollback: ./scripts/rollback-canary.sh"
echo "  Promote: az containerapp ingress traffic set --name $APP_NAME --resource-group $RESOURCE_GROUP --revision-weight <canary-rev>=100"