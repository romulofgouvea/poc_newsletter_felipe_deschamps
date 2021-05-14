FROM node:alpine

# Install base packages
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates
RUN apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main
# RUN apk add --nocache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

# Change TimeZone
RUN apk add --update tzdata
ENV TZ=America/Sao_Paulo

# Clean APK cache
RUN rm -rf /var/cache/apk/*

#Criando o diretório
RUN mkdir -p /usr/local/maker-poc-newsletter
WORKDIR /usr/local/maker-poc-newsletter
# RUN chmod -R 777 /usr/local/maker-poc-newsletter

COPY package*.json ./
RUN npm install

COPY . /usr/local/maker-poc-newsletter

CMD npm start