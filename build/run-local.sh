#!/bin/bash -e

if [ ! -f ./Dockerfile ]; then
  echo You must run this script from the build/ subdirectory
  exit 1
fi

docker build . -t guardianmultimedia/pluto-start:DEV

echo Starting up pluto-start on port 8000...
docker run --rm -it -p 8000:80 -v $PWD/local-config:/etc/oauth-config guardianmultimedia/pluto-start:DEV