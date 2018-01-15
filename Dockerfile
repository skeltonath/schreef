FROM node:carbon-alpine

# Create app directory
WORKDIR /app

# Install build tools for node-gyp
RUN apk add --no-cache make gcc g++ python

# Install node_modules with yarn
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --prod
RUN mkdir -p /app && cd /app && ln -s /tmp/node_modules

# Remove node-gyp build tools after build
RUN apk del make gcc g++ python

# Copy app
COPY . /app
# Expose port
EXPOSE 8000
# Run app
CMD ["npm","start"]