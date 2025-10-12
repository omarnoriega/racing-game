#!/bin/bash

# Script para crear AKS y recursos relacionados
set -e

# ============================================
# CONFIGURACIÓN - EDITAR ESTOS VALORES
# ============================================

SUBSCRIPTION_ID="556b812f-3bdd-4e65-bdbc-c982a185ce9b"  # TODO: Tu subscription ID
RESOURCE_GROUP="racing-game-rg-aks"
LOCATION="westus2"
AKS_NAME="racing-game-aks"
ACR_NAME="racinggamecr"  # TODO: Nombre único del ACR
NODE_COUNT=2
NODE_SIZE="Standard_D2s_v3"

# Cosmos DB
COSMOS_ACCOUNT_NAME=""  # TODO: Nombre único
COSMOS_DB_NAME="racing-game-db"

# ============================================
# SCRIPT
# ============================================

echo "🚀 Iniciando setup de AKS..."

# Login y seleccionar suscripción
az account show || az login
if [ ! -z "$SUBSCRIPTION_ID" ]; then
  az account set --subscription $SUBSCRIPTION_ID
fi

# Crear Resource Group
echo "📦 Creando Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Crear AKS con integración ACR
echo "☸️  Creando AKS cluster (esto puede tardar 10-15 minutos)..."
az aks create \
  --name $AKS_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --node-count $NODE_COUNT \
  --node-vm-size $NODE_SIZE \
  --network-plugin azure \
  --enable-managed-identity \
  --attach-acr $ACR_NAME \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --tier free

echo "✅ AKS cluster creado"

# Obtener credenciales de kubectl
echo "🔧 Configurando kubectl..."
az aks get-credentials \
  --name $AKS_NAME \
  --resource-group $RESOURCE_GROUP \
  --overwrite-existing

# Verificar conexión
kubectl cluster-info
kubectl get nodes

# Instalar NGINX Ingress Controller
echo "🌐 Instalando NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Esperar a que el ingress controller esté listo
echo "⏳ Esperando a que el Ingress Controller esté listo..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Instalar cert-manager para SSL
echo "🔒 Instalando cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml

# Esperar a que cert-manager esté listo
echo "⏳ Esperando a que cert-manager esté listo..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=300s

# Crear namespace
echo "📛 Creando namespace..."
kubectl create namespace racing-game

# Crear secret para ACR
echo "🔐 Creando secrets..."
kubectl create secret docker-registry acr-secret \
  --namespace racing-game \
  --docker-server=$ACR_NAME.azurecr.io \
  --docker-username=$(az acr credential show --name $ACR_NAME --query username -o tsv) \
  --docker-password=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Crear secret para MongoDB y JWT
JWT_SECRET=$(openssl rand -hex 64)
kubectl create secret generic racing-game-secrets \
  --namespace racing-game \
  --from-literal=mongodb-uri="$MONGODB_URI" \
  --from-literal=jwt-secret="$JWT_SECRET"

echo "✅ Secrets creados"

# Obtener IP pública del Ingress
echo "⏳ Esperando IP pública del Ingress..."
INGRESS_IP=""
while [ -z "$INGRESS_IP" ]; do
  INGRESS_IP=$(kubectl get service -n ingress-nginx ingress-nginx-controller \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  [ -z "$INGRESS_IP" ] && sleep 10
done

echo "✅ Ingress IP: $INGRESS_IP"

# Resumen
echo ""
echo "✅ =========================================="
echo "✅ SETUP COMPLETADO"
echo "✅ =========================================="
echo ""
echo "📦 Resource Group: $RESOURCE_GROUP"
echo "☸️  AKS Cluster: $AKS_NAME"
echo "🐳 ACR: $ACR_NAME.azurecr.io"
echo "🌐 Ingress IP: $INGRESS_IP"
echo "🍃 MongoDB URI: (guardado en secret)"
echo "🔐 JWT Secret: (guardado en secret)"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configurar DNS: Apunta tu dominio a $INGRESS_IP"
echo "2. Actualizar k8s/ingress.yaml con tu dominio"
echo "3. Actualizar k8s/configmap.yaml con las URLs"
echo "4. Actualizar manifiestos con el nombre del ACR: $ACR_NAME"
echo "5. Aplicar ClusterIssuer para Let's Encrypt"
echo "6. Configurar Azure DevOps pipeline"
echo "7. Push código para desplegar"
echo ""
echo "Comandos útiles:"
echo "  kubectl get all -n racing-game"
echo "  kubectl logs -f deployment/racing-game-backend -n racing-game"
echo "  kubectl get ingress -n racing-game"
echo ""