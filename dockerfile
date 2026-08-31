FROM node:18-alpine
RUN apk add --no-cache bash curl ca-certificates \
    && curl -sL https://github.com/SagerNet/sing-box/releases/download/v1.9.0/sing-box-1.9.0-linux-amd64.tar.gz | tar -xz \
    && mv sing-box-1.9.0-linux-amd64/sing-box /usr/local/bin/ \
    && rm -rf sing-box-1.9.0-linux-amd64
WORKDIR /app
COPY . .
RUN chmod +x start.sh
CMD ["sh", "start.sh"]
