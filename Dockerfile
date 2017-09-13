FROM node:8-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
#COPY package.json .

# For npm@5 or later, copy package-lock.json as well
COPY package.json yarn.lock ./

RUN apk add --no-cache git
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "yarn", "start" ]
