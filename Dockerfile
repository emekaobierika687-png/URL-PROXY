FROM node:18-alpine

ENV NODE_ENV=production

EXPOSE 8080/tcp

LABEL maintainer="Mercury Workshop"
LABEL summary="Scramjet Demo Image"
LABEL description="Example application of Scramjet"

WORKDIR /app

# Install system dependencies
RUN apk add --upgrade --no-cache python3 make g++

# Enable pnpm via corepack
RUN corepack enable

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install production dependencies 
# CHANGED: Removed --frozen-lockfile so it updates when package.json changes
RUN pnpm install --no-frozen-lockfile --prod

# Copy app source
COPY . .

ENTRYPOINT ["node"]
CMD ["src/index.js"]
