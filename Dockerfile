# install latest node
# https://hub.docker.com/_/node/
FROM node:latest

ENV MONGODB_URI mongodb://mongo

# create and set app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

# install app dependencies
# this is done before the following COPY command to take advantage of layer caching
COPY package.json .
RUN npm i

# copy app source to destination container
COPY . .

# expose container port
EXPOSE 3000

CMD npm start
