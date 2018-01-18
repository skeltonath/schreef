FROM node:carbon-alpine

# use nodemon for development
RUN npm install --global nodemon

# Install build tools for node-gyp
RUN apk add --no-cache make gcc g++ python

# Install node_modules with yarn
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --prod
RUN mkdir -p /usr/app && cd /usr/app && ln -s /tmp/node_modules

# Remove node-gyp build tools after build
RUN apk del make gcc g++ python

# Create app directory and copy app
WORKDIR /usr/app
COPY . /usr/app

# Expose port
EXPOSE 8000

# Run app
CMD ["npm","start"]