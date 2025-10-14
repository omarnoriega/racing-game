#!/bin/bash

# Test de conexión WebSocket

GAME_ID="test-123"
BACKEND_URL="racing-game-backend.gentleisland-51245d58.westus2.azurecontainerapps.io"  
$FRONTEND_URL="racing-game-frontend.gentleisland-51245d58.westus2.azurecontainerapps.io"


echo "🧪 Testing WebSocket connection..."
echo "Backend URL: https://$BACKEND_URL"
echo ""

# Test 1: Health check
echo "1️⃣ Testing Health Endpoint..."
curl -i "https://$BACKEND_URL/health"
echo ""

# Test 2: CORS test
echo "2️⃣ Testing CORS..."
curl -i -X OPTIONS "https://$BACKEND_URL/api/test" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET"
echo ""

# Test 3: Socket.IO handshake
echo "3️⃣ Testing Socket.IO handshake..."
curl -i "https://$BACKEND_URL/socket.io/?EIO=4&transport=polling"
echo ""

echo "✅ Tests completed"
echo ""
echo "💡 If any test fails, check:"
echo "  - Backend logs: az containerapp logs show --name racing-game-backend --resource-group racing-game-rg --tail 50"
echo "  - CORS_ORIGIN env var: az containerapp show --name racing-game-backend --resource-group racing-game-rg --query 'properties.template.containers[0].env'"