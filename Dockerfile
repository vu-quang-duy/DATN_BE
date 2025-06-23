FROM node:20.12.2-alpine AS base

# builder stage
FROM base AS builder 
ARG APP 
WORKDIR /usr/src/app 
RUN apk add --no-cache python3 make g++ 

COPY package.json  ./ 
RUN npm install

COPY . . 
RUN npm run build

RUN npm exec -- husky install

# production stage
FROM base AS production 
ARG APP 
ARG NODE_ENV=production 
ENV NODE_ENV=${NODE_ENV} 
WORKDIR /usr/src/app 

RUN apk add --no-cache mysql-client;
RUN apk add --no-cache python3 make g++

COPY package.json  ./ 

RUN apk add --no-cache jq && \
    jq 'del(.scripts.prepare)' package.json > package.tmp.json && \
    mv package.tmp.json package.json

RUN npm install --omit=dev --unsafe-perm

COPY --from=builder /usr/src/app/dist ./dist 

CMD ["node", "dist/main"]