# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependencias
RUN npm ci --only=production && \
    cd backend && npm ci --only=production

# Etapa 2: Production
FROM node:18-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependencias desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules

# Copiar código de la aplicación
COPY --chown=nodejs:nodejs backend ./backend
COPY --chown=nodejs:nodejs frontend ./frontend
COPY --chown=nodejs:nodejs package*.json ./

# Crear directorios necesarios
RUN mkdir -p ./backend/logs ./backend/uploads && \
    chown -R nodejs:nodejs ./backend/logs ./backend/uploads

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "backend/server.js"]
