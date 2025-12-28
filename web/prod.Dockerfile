FROM node:20 AS builder

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV HOSTNAME "0.0.0.0"

COPY . .
RUN npm install && npm run build

# start app
CMD [ "npm", "run", "start" ]