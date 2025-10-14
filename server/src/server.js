// ============================================
// CONFIGURACIÓN CORS PARA AMBAS VERSIONES
// ============================================

const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Lista de orígenes permitidos
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost',
  'https://localhost:3000',
  'https://localhost'
];

// Si CORS_ORIGIN tiene múltiples URLs (separadas por coma)
if (FRONTEND_URL.includes(',')) {
  const origins = FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...origins);
}

console.log('🔐 CORS Allowed Origins:', allowedOrigins);

// CORS para Express
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc)
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

// CORS para Socket.IO
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
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000
});

// Log detallado de conexiones
io.on('connection', (socket) => {
  const origin = socket.handshake.headers.origin;
  const userAgent = socket.handshake.headers['user-agent'];
  
  console.log('✅ Socket.IO client connected:', {
    id: socket.id,
    origin: origin,
    userAgent: userAgent ? userAgent.substring(0, 50) : 'unknown'
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO client disconnected:', socket.id, 'reason:', reason);
  });
});