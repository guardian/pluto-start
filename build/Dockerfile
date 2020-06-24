FROM nginx:1.17-alpine

COPY docker-entrypoint.sh /
COPY nginx-server.conf /etc/nginx/conf.d/default.conf
RUN nginx -t
COPY index.html /usr/share/nginx/html
ADD static/ /usr/share/nginx/html/static
COPY bundle.js /usr/share/nginx/html

CMD /docker-entrypoint.sh