require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeSocketService } = require('./services/socketService');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// ============================================
// CONFIGURACIÓN CORS PARA CONTAINER APPS
// ============================================

const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Lista de orígenes permitidos (agregar todas las variantes)
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost',
  'https://localhost:3000',
  'https://localhost'
];

// Si hay una URL específica del frontend, agregarla
if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
  allowedOrigins.push(FRONTEND_URL);
}

console.log('🔐 CORS Allowed Origins:', allowedOrigins);

// Configurar CORS para Express
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// CONFIGURACIÓN SOCKET.IO PARA CONTAINER APPS
// ============================================

const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.log('❌ Socket.IO CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'], // Importante: permitir ambos
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Log de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('✅ Socket.IO client connected:', socket.id, 'from:', socket.handshake.headers.origin);
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO client disconnected:', socket.id, 'reason:', reason);
  });
});

// Middleware
app.use(express.json());

// Conectar a MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));
} else {
  console.log('⚠️  MongoDB URI no configurada, usando almacenamiento en memoria');
}

// Inicializar Socket.IO
initializeSocketService(io);

// Rutas
app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);

// Health check con info adicional
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    cors: allowedOrigins,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    socketio: io.engine.clientsCount + ' clients connected'
  });
});

// Endpoint para verificar CORS
app.get('/api/test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowed: true
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔐 CORS configurado para: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };

/* require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeSocketService } = require('./services/socketService');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Inicializar Socket.IO
initializeSocketService(io);

// Rutas
app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
*/