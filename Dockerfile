FROM node
MAINTAINER Jean-Philippe LAINÉ

COPY . /usr/src/app

WORKDIR /usr/src/app/api
RUN npm install
