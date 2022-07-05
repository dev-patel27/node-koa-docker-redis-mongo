FROM node:10-alpine
RUN mkdir -p /home/node/node_modules && chown -R node:node /home/node/
WORKDIR /home/node/
COPY package*.json ./
USER node
RUN npm i -g yarn
RUN yarn
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "yarn", "start" ]