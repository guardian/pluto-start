FROM nginx:1.17-alpine

COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY oauth-config.json /usr/share/nginx/html/meta/oauth/config.json
COPY index.html /usr/share/nginx/html
COPY bundle.js /usr/share/nginx/html
