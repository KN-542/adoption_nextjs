FROM node:16.17.1-bullseye
WORKDIR /app
RUN apt update \
    && yarn install \
    && npx playwright install \
    && npx playwright install-deps \
    && npx playwright install chrome \
    && npx playwright install msedge
EXPOSE 3000