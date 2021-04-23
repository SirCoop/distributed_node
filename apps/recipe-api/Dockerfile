# Deps stage

# specify image base
FROM node:14.8.0-alpine3.12 AS deps
# switch to container working directory i.e. cd /srv
WORKDIR /srv
# copy file from host to container
COPY package*.json ./
# install npm modules if env=prod
# npm ci is faster than npm install
RUN npm ci --only=production
# COPY package.json yarn.lock ./
# RUN yarn install --production

# Release stage

# this base image is for prod because it is smaller than dep stage image base
FROM alpine:3.12 AS release
# define environment variables used by other directives
# node version
ENV V 14.8.0
# tarball to be downloaded
ENV FILE node-v$V-linux-x64-musl.tar.xz

# these commands are bundled into one RUN command in order to 
# keep number of docker layers small
# NOTE alpine uses a package manager called apk
RUN apk add --no-cache libstdc++ \
    && apk add --no-cache --virtual .deps curl \
    && curl -fsSLO --compressed \
    "http://unofficial-builds.nodejs.org/download/release/v$V/$FILE" \
    && tar -xJf $FILE -C /usr/local --strip-components=1 \
    && rm -f $FILE /usr/local/bin/npm /usr/local/bin/npx \
    && rm -rf /usr/local/lib/node_modules \
    && apk del .deps

# second half of release stage

WORKDIR /srv
# copy files from another stage of image build, not from host os filesystem
COPY --from=deps /srv/node_modules ./node_modules
# copy files from cwd (.) to /srv (WORKDIR)
# NOTE: this copies EVERY file that isn't ignored
# therefore, be diligent with .dockerignore
COPY . .
# image listens on this port
EXPOSE 1337
# env vars for containerized app
ENV HOST 0.0.0.0
ENV PORT 1337
# executes when container is run
# node binary executes and then runs producer file
CMD [ "node", "producer-http-basic.js" ]