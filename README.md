# 🏁 Racing Game - Juego de Carreras Multijugador

Juego web multijugador de carreras donde los jugadores impulsan vehículos mediante taps en sus pantallas móviles.

## 🚀 Características

- ⚡ Juego en tiempo real con WebSockets
- 📱 Optimizado para móviles (responsive)
- 👥 Dos equipos competitivos
- 🎮 Panel de administración
- 🏆 Sistema de puntuación en vivo

## 🛠️ Tecnologías

**Frontend:**
- React 18
- Socket.io Client
- React Router

**Backend:**
- Node.js
- Express
- Socket.io
- MongoDB (opcional)

## 📦 Instalación

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Backend
\`\`\`bash
cd server
npm install
cp .env.example .env
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd client
npm install
cp .env.example .env
npm start
\`\`\`

## 🎮 Cómo Jugar

1. **Crear Partida:** Accede a la página principal y crea una nueva partida
2. **Unirse:** Los jugadores se unen usando el ID de la partida
3. **Seleccionar Equipo:** Cada jugador elige Equipo Rojo o Equipo Azul
4. **Administrador:** El admin inicia la partida desde el panel de administración
5. **¡A correr!:** Los jugadores hacen tap en sus pantallas para impulsar su vehículo
6. **Ganar:** El primer equipo en llegar a 1000m gana

## 📱 Rutas

- `/` - Página principal
- `/game/:gameId` - Pantalla de juego
- `/admin` - Panel de administración

## 🔧 Variables de Entorno

Ver `.env.example` en cada carpeta (client y server)

## 📝 Licencia

MIT

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, crea un issue primero para discutir los cambios.