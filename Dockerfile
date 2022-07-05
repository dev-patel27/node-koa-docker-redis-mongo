FROM node:16-alpine
WORKDIR /home/node_app/
COPY package*.json ./
RUN yarn
COPY --chown=node:node . .
EXPOSE 5001
CMD [ "yarn", "start" ]
