#!/bin/bash

# Script para crear la infraestructura en Azure
# Ejecutar: bash setup-azure.sh

set -e

# ============================================
# CONFIGURACIÓN - EDITAR ESTOS VALORES
# ============================================

SUBSCRIPTION_ID="556b812f-3bdd-4e65-bdbc-c982a185ce9b"  # TODO: Tu subscription ID
RESOURCE_GROUP="racing-game-rg"
LOCATION="westus2"
ACR_NAME="racinggamecr"  # TODO: Nombre único del ACR (solo letras y números)
ENVIRONMENT_NAME="racing-game-env"
BACKEND_APP_NAME="racing-game-backend"
FRONTEND_APP_NAME="racing-game-frontend"

# Cosmos DB (MongoDB API)
COSMOS_ACCOUNT_NAME=""  # TODO: Nombre único
COSMOS_DB_NAME="racing-game-db"

# Log Analytics
LOG_ANALYTICS_WORKSPACE="racing-game-logs"

# ============================================
# SCRIPT
# ============================================

echo "🚀 Iniciando setup de Azure Infrastructure..."

# Login
echo "📝 Verificando login en Azure..."
az account show || az login

# Seleccionar suscripción
if [ ! -z "$SUBSCRIPTION_ID" ]; then
  echo "📌 Seleccionando suscripción: $SUBSCRIPTION_ID"
  az account set --subscription $SUBSCRIPTION_ID
fi

# Obtener credenciales de ACR

ACR_LOGIN_SERVER=$(az acr show \
  --name $ACR_NAME \
  --resource-group $RESOURCE_GROUP \
  --query loginServer \
  --output tsv)

ACR_USERNAME=$(az acr credential show \
  --name $ACR_NAME \
  --resource-group $RESOURCE_GROUP \
  --query username \
  --output tsv)

ACR_PASSWORD=$(az acr credential show \
  --name $ACR_NAME \
  --resource-group $RESOURCE_GROUP \
  --query passwords[0].value \
  --output tsv)

echo "✅ ACR creado: $ACR_LOGIN_SERVER"

# Crear Log Analytics Workspace
echo "📊 Creando Log Analytics Workspace..."
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --location $LOCATION

LOG_ANALYTICS_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --query customerId \
  --output tsv)

LOG_ANALYTICS_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --query primarySharedKey \
  --output tsv)

echo "✅ Log Analytics creado"

# Crear Container Apps Environment
echo "🏗️  Creando Container Apps Environment..."
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --logs-workspace-id $LOG_ANALYTICS_ID \
  --logs-workspace-key $LOG_ANALYTICS_KEY

echo "✅ Container Apps Environment creado"

# Crear Backend Container App
echo "🔧 Creando Backend Container App..."
az containerapp create \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3001 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --env-vars \
    NODE_ENV=production \
    PORT=3001 \
    MONGODB_URI="$MONGODB_URI" \
    JWT_SECRET=changeme-in-production \
    CORS_ORIGIN=https://$FRONTEND_APP_NAME.${LOCATION}.azurecontainerapps.io

BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "✅ Backend Container App creado: https://$BACKEND_URL"

# Crear Frontend Container App
echo "🎨 Creando Frontend Container App..."
az containerapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD

FRONTEND_URL=$(az containerapp show \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "✅ Frontend Container App creado: https://$FRONTEND_URL"

# Actualizar CORS en backend
echo "🔄 Actualizando CORS en backend..."
az containerapp update \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars CORS_ORIGIN=https://$FRONTEND_URL

# Resumen
echo ""
echo "✅ =========================================="
echo "✅ SETUP COMPLETADO"
echo "✅ =========================================="
echo ""
echo "📦 Resource Group: $RESOURCE_GROUP"
echo "🐳 ACR: $ACR_LOGIN_SERVER"
echo "🔧 Backend URL: https://$BACKEND_URL"
echo "🎨 Frontend URL: https://$FRONTEND_URL"
echo "🍃 MongoDB URI: (guardado en variables de entorno)"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configurar Azure DevOps Service Connection"
echo "2. Crear Variable Group 'racing-game-config' con:"
echo "   - MONGODB_URI_DEV"
echo "   - MONGODB_URI_PROD"
echo "   - JWT_SECRET"
echo "   - CORS_ORIGIN_DEV"
echo "   - CORS_ORIGIN_PROD"
echo "   - REACT_APP_API_URL"
echo "   - REACT_APP_WS_URL"
echo "3. Configurar el pipeline en Azure DevOps"
echo "4. Push a develop o main para desplegar"
echo ""