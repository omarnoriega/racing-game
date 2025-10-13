#!/bin/bash

RESOURCE_GROUP="racing-game-rg"
BACKEND_APP="racing-game-backend"
FRONTEND_APP="racing-game-frontend"

echo "🔍 Verificando configuración..."
echo ""

# Backend
echo "📦 Backend Configuration:"
az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress" \
  --output json

echo ""
echo "🔐 Backend Environment Variables:"
az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.containers[0].env" \
  --output table

echo ""
echo "📦 Frontend Configuration:"
az containerapp show \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress" \
  --output json

# Test CORS
BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo ""
echo "🧪 Testing Backend Health:"
curl -i "https://$BACKEND_URL/health"

echo ""
echo "🧪 Testing CORS:"
curl -i -X OPTIONS "https://$BACKEND_URL/api/test" \
  -H "Origin: https://<tu-frontend-url>.azurecontainerapps.io" \
  -H "Access-Control-Request-Method: GET"