FROM node:16-alpine3.11
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install

COPY ./ .

RUN npm run compile


EXPOSE 3000

CMD ["npm", "run",  "start"]