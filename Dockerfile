# Stage 1: Build React frontend
FROM node:20-alpine as build-frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Run backend and serve frontend
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=build-frontend /app/frontend/dist ./dist

# Expose backend port
EXPOSE 4000

# Set environment variables (override with docker run -e)
ENV NODE_ENV=production

# Start backend (serves both API and frontend)
CMD ["node", "server.js"]
