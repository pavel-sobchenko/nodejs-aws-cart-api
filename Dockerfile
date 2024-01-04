#Development
FROM node:20-alpine as dev
WORKDIR /app
COPY package*.json ./
RUN npm install
ENV NODE_ENV prod
COPY . .
USER node

#Build
FROM node:20-alpine as build
WORKDIR /app
COPY --from=dev /app/package*.json ./
COPY --from=dev /app/node_modules ./node_modules
COPY . .
RUN npm run build
ENV NODE_ENV prod
RUN npm install --only=prod && npm cache clean --force
USER node

#Production
FROM node:20-alpine as prod
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node

EXPOSE 8080

CMD ["node", "dist/src/main.js"]
