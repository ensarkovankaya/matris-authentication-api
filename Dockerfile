FROM node:10.7.0-jessie

WORKDIR /home/node/app

ENV NODE_ENV=test

COPY . /home/node/app

ENTRYPOINT /home/node/app/entrypoint.sh
