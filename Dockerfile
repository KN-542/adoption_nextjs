FROM node:16.17.1-bullseye
WORKDIR /app
RUN apt update \
    && yarn install
EXPOSE 3000