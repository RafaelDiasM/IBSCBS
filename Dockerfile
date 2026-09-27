# =================================================================
# Stage 1: Build (Compilação do Client e Server)
# =================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifestos de dependências para aproveitar cache de camadas
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Instala todas as dependências
RUN npm run install:all

# Copia todo o código-fonte
COPY . .

# Compila o frontend React (client/dist) e o backend TypeScript (server/dist)
RUN npm run build

# =================================================================
# Stage 2: Runner (Imagem Enxuta de Produção)
# =================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 easyapi

# Copia dependências e build do servidor
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/server/package.json /app/server/package-lock.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/src/docs ./server/dist/docs
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/ibscbs-easyapi.postman_collection.json ./

# Copia build estático do frontend
COPY --from=builder /app/client/dist ./client/dist

# Ajusta permissões
USER easyapi

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/observabilidade/health || exit 1

CMD ["node", "server/dist/server.js"]
