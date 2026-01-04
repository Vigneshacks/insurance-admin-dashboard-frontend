FROM node:23-alpine

WORKDIR /frontend

COPY package.json /frontend/package.json

RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
