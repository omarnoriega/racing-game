#!/bin/bash

# Script para eliminar toda la infraestructura
# Ejecutar: bash teardown-azure.sh

set -e

RESOURCE_GROUP="racing-game-rg"

echo "⚠️  =========================================="
echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los recursos"
echo "⚠️  Resource Group: $RESOURCE_GROUP"
echo "⚠️  =========================================="
echo ""
read -p "¿Estás seguro? (escribe 'yes' para confirmar): " confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Operación cancelada"
  exit 1
fi

echo "🗑️  Eliminando Resource Group..."
az group delete \
  --name $RESOURCE_GROUP \
  --yes \
  --no-wait

echo "✅ Eliminación iniciada (puede tardar varios minutos)"
echo "💡 Verifica el estado con: az group show --name $RESOURCE_GROUP"