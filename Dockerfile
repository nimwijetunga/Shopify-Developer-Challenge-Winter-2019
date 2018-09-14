FROM node:carbon

ENV port 8080

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
