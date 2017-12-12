FROM node:8.9.3-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080
CMD ["npm", "start"]
