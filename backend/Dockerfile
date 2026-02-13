# Build Stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
RUN npm ci
RUN npx prisma generate

COPY . .

# Build the TypeScript code
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies (optional if we copied node_modules, 
# but copying node_modules from builder is safer for native modules unless we prune)
# To be safe and clean, let's just use the copied modules or prune them properly.
# For simplicity with Prisma/bcrypt which can be tricky, we'll stick to copying.

EXPOSE 3001

# Start command
CMD ["node", "dist/index.js"]
