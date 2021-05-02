FROM node:16-alpine3.11
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY ./ .

# I know it's slower, but at least it will work
RUN npm install

RUN npm run compile


EXPOSE 3000

CMD ["npm", "run",  "start"]