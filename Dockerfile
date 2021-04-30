# Install dependencies only when needed
FROM node:14.16.1-alpine
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "run",  "start"]