FROM node:22-alpine

WORKDIR /app

COPY ./ /app/
# Install dependencies based on the preferred package manager
# COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# # Copy the Prisma schema file to the Docker container
# COPY src/prisma/schema.prisma src/prisma/

RUN npm install -g pnpm@9.1.4
RUN pnpm i

COPY start.sh .
RUN chmod +x start.sh
CMD ["/bin/sh", "./start.sh"]