FROM node:20.12.2-alpine AS base

# Builder stage
FROM base AS builder 
ARG APP 
WORKDIR /usr/src/app 
RUN apk add --no-cache python3 make g++ 

COPY package.json . 
RUN npm install

COPY . . 
RUN npm run build

# Production stage
FROM base AS production 
ARG APP 
ARG NODE_ENV=production 
ENV NODE_ENV=${NODE_ENV} 
WORKDIR /usr/src/app 

# Cài mysql-client (nếu cần kết nối DB từ trong container)
RUN apk add --no-cache mysql-client
RUN apk add --no-cache python3 make g++

COPY package.json . 

# Xóa script prepare (husky) để tránh lỗi khi install
RUN apk add --no-cache jq && \
    jq 'del(.scripts.prepare)' package.json > package.tmp.json && \
    mv package.tmp.json package.json

# Chỉ cài production dependencies
RUN npm install --omit=dev --unsafe-perm

# Copy file build từ builder
COPY --from=builder /usr/src/app/dist ./dist 

# Mở cổng 8088
EXPOSE 8088

# Chạy server
CMD ["node", "dist/main"]