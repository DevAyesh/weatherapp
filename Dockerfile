# Stage 1: Build React frontend
FROM node:20-alpine as build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run backend and serve frontend
FROM node:20-alpine
WORKDIR /app
COPY --from=build-frontend /app /app

# Install only production dependencies
RUN npm install --omit=dev

# Expose backend port
EXPOSE 4000

# Set environment variables (override with docker run -e)
ENV NODE_ENV=production

# Start backend (serves both API and frontend)
CMD ["node", "server.js"]
