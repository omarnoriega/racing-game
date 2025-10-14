#!/bin/bash

# Limpiar revisiones antiguas de Container Apps

set -e

# Configuración
#RESOURCE_GROUP="${1:-racing-game-rg}"
RESOURCE_GROUP="racing-game-rg"
APP_NAME="${1}"
KEEP_LATEST="${2:-2}"  # Número de revisiones a mantener

if [ -z "$APP_NAME" ]; then
  echo "❌ Error: APP_NAME es requerido"
  echo "Usage: $0 <RESOURCE_GROUP> <APP_NAME> [KEEP_LATEST]"
  echo "Example: $0 racing-game-rg racing-game-backend 2"
  exit 1
fi

echo "🧹 Cleaning up old revisions for $APP_NAME..."
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Keep latest: $KEEP_LATEST revision(s)"
echo ""

# Obtener todas las revisiones (ordenadas por fecha de creación, más reciente primero)
REVISIONS=$(az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "sort_by([].{name:name, created:properties.createdTime, active:properties.active, traffic:properties.trafficWeight}, &created) | reverse(@)" \
  --output json)

TOTAL_REVISIONS=$(echo "$REVISIONS" | jq '. | length')

echo "📊 Found $TOTAL_REVISIONS total revision(s)"
echo ""

# Mostrar revisiones actuales
echo "Current revisions:"
echo "$REVISIONS" | jq -r '.[] | "\(.name) - Traffic: \(.traffic)% - Active: \(.active)"'
echo ""

if [ $TOTAL_REVISIONS -le $KEEP_LATEST ]; then
  echo "✅ No cleanup needed. Only $TOTAL_REVISIONS revision(s) exist."
  exit 0
fi

# Obtener revisiones a eliminar (todas excepto las últimas N)
REVISIONS_TO_DELETE=$(echo "$REVISIONS" | jq -r ".[$KEEP_LATEST:] | .[].name")
DELETE_COUNT=$(echo "$REVISIONS_TO_DELETE" | wc -l)

echo "🗑️  Will delete $DELETE_COUNT old revision(s):"
echo "$REVISIONS_TO_DELETE"
echo ""

# Confirmar
read -p "Continue with deletion? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cleanup cancelled"
  exit 0
fi

# Eliminar revisiones antiguas
for REVISION in $REVISIONS_TO_DELETE; do
  echo "🗑️  Deleting revision: $REVISION"
  
  # Verificar si tiene tráfico asignado
  TRAFFIC=$(echo "$REVISIONS" | jq -r ".[] | select(.name == \"$REVISION\") | .traffic")
  
  if [ "$TRAFFIC" != "0" ] && [ "$TRAFFIC" != "null" ]; then
    echo "⚠️  Warning: Revision $REVISION has $TRAFFIC% traffic. Removing traffic first..."
    
    # Remover tráfico antes de eliminar
    az containerapp ingress traffic set \
      --name $APP_NAME \
      --resource-group $RESOURCE_GROUP \
      --revision-weight $REVISION=0 \
      --output none
    
    echo "   Traffic removed, waiting 10 seconds..."
    sleep 10
  fi
  
  # Desactivar revisión
  az containerapp revision deactivate \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --revision $REVISION \
    --output none
  
  echo "   ✅ Deactivated: $REVISION"
done

echo ""
echo "✅ Cleanup completed successfully!"
echo ""

# Mostrar revisiones restantes
echo "Remaining revisions:"
az containerapp revision list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[].{Name:name, Traffic:properties.trafficWeight, Active:properties.active}" \
  --output table