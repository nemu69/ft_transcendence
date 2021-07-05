FROM node:16

WORKDIR /usr/src/app/backend

COPY backend/package*.json ./
# RUN npm uninstall bcrypt
# RUN npm i bcrypt

RUN npm install

EXPOSE 3000
CMD [ "node", "dist/main" ]
