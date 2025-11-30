FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Use legacy peer deps to avoid NestJS/@nestjs/swagger conflicts
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]
