FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18 AS production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
