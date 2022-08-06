FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

CMD [ "node", "." ]
