FROM alpine:3.11.2

#Workaround for DNS failing when under VPN
RUN /usr/bin/nslookup dl-cdn.alpinelinux.org
RUN apk --no-cache add jq curl bash
RUN adduser -D keysync
COPY keysync.sh /usr/local/bin
USER keysync
