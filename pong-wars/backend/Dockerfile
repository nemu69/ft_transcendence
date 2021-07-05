FROM node:16

WORKDIR /usr/src/app/backend

COPY backend/package*.json ./

RUN npm install

# RUN npm i bcrypt
# RUN npm uninstall bcrypt

EXPOSE 3000
CMD [ "node", "dist/main" ]
