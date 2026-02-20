FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ .

# Copy Prisma schema from database folder (docker-compose builds from root context)
COPY database/prisma/schema.prisma ./prisma/schema.prisma

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3001

CMD ["node", "api.cjs"]
