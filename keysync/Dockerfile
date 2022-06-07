#If you get DNS issues building locally, try alpine:3.11.2
FROM alpine:latest

RUN apk --no-cache add jq curl bash
RUN adduser -D keysync
COPY keysync.sh /usr/local/bin
USER keysync
