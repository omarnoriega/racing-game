# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY shared ./shared

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copiar desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/shared ./shared

# Variables de entorno (se sobreescriben en runtime)
ENV NODE_ENV=production
ENV PORT=3001

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usuario no-root por seguridad
USER node

# Iniciar aplicación
CMD ["node", "src/server.js"]