FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install --save http-proxy-middleware
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]






