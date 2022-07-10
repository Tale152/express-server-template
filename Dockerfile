FROM node:alpine
WORKDIR /spark_server
COPY package.json .
COPY package-lock.json .
RUN npm install --omit=dev
COPY tsconfig.json .
COPY src ./src
RUN npm run build
CMD npm run start