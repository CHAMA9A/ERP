FROM node:20-alpine

WORKDIR /app

COPY database/package*.json ./

RUN npm install

COPY database/ .

RUN npx prisma generate --schema=./prisma/schema.prisma

CMD ["npx", "prisma", "db", "push", "--accept-data-loss", "--schema=./prisma/schema.prisma"]