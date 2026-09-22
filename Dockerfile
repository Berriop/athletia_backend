FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

ENV NODE_ENV=production \
    PORT=3000 \
    JWT_SECRET=change-me-in-production \
    GOOGLE_MAPS_API_KEY=change-me-in-production \
    DATABASE_URL=postgresql://postgres:postgres@db:5432/athletia

RUN npx prisma generate && npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
