FROM node:14.5.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

CMD [ "node", "." ]
