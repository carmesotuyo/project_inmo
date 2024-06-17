FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy all other source code to container
COPY . .

CMD ["npm", "run", "start"]
