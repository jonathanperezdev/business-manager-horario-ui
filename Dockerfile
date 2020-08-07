FROM mhart/alpine-node:11 AS builder
WORKDIR /app

COPY . /app
RUN ls -la

RUN npm install react-scripts -g --silent
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]