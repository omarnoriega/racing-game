#!/bin/bash

# Incrementar gradualmente el tráfico al canary

RESOURCE_GROUP="racing-game-rg"
APP_NAME="racing-game-frontend"

# Obtener revisiones actuales
STABLE_REVISION=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'tap')].name" \
  --output tsv | head -n 1)

CANARY_REVISION=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[?contains(name, 'motion')].name" \
  --output tsv | head -n 1)

echo "Current revisions:"
echo "  Stable: $STABLE_REVISION"
echo "  Canary: $CANARY_REVISION"
echo ""

# Menú interactivo
echo "Select traffic distribution:"
echo "1) 80% Stable / 20% Canary"
echo "2) 70% Stable / 30% Canary"
echo "3) 50% Stable / 50% Canary (A/B Testing)"
echo "4) 30% Stable / 70% Canary"
echo "5) 0% Stable / 100% Canary (Promote to production)"
echo "6) 100% Stable / 0% Canary (Rollback)"

read -p "Choose option (1-6): " option

case $option in
  1)
    STABLE=80
    CANARY=20
    ;;
  2)
    STABLE=70
    CANARY=30
    ;;
  3)
    STABLE=50
    CANARY=50
    ;;
  4)
    STABLE=30
    CANARY=70
    ;;
  5)
    STABLE=0
    CANARY=100
    ;;
  6)
    STABLE=100
    CANARY=0
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "🔀 Setting traffic to: ${STABLE}% Stable / ${CANARY}% Canary"

az containerapp ingress traffic set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision-weight ${STABLE_REVISION}=${STABLE} ${CANARY_REVISION}=${CANARY}

echo "✅ Traffic updated successfully!"