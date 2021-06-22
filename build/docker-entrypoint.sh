#!/bin/sh

if [ ! -d /etc/oauth-config ]; then
  echo ERROR: Can\'t find /etc/oauth-config for accessing the oauth config
  exit 1
fi

/usr/local/bin/menu-validator -file /etc/menu-config/menu.json
if [ "$?" != "0" ]; then
  echo Validation failed
  exit 1
fi

mkdir -p /usr/share/nginx/html/meta/menu-config
cp -avL /etc/menu-config/* /usr/share/nginx/html/meta/menu-config

mkdir -p /usr/share/nginx/html/meta/oauth
cp -avL /etc/oauth-config/* /usr/share/nginx/html/meta/oauth

if [ -f /etc/wallpaper/config.json ]; then
  cp -avL /etc/wallpaper/config.json /usr/share/nginx/html/meta/wallpaper-config.json
fi

if [ -d /opt/wallpaper ]; then
  mkdir -p /usr/share/nginx/html/wallpaper
  cp -avL /opt/wallpaper/*.jpg /usr/share/nginx/html/wallpaper
fi

echo Running server....
nginx -g 'daemon off;'