FROM node:alpine
WORKDIR /server
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY tsconfig.json .
COPY src ./src
RUN npm run build
RUN rm -r src tsconfig.json
CMD npm run start
