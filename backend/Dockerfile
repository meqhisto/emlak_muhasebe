FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
