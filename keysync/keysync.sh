#!/bin/bash

if [ ! -f "/etc/oauth/config.json" ]; then
  echo ERROR Could not find /etc/oauth/config.json
  exit 1
fi

JWKS_URI=$(jq -r .jwksUri < /etc/oauth/config.json)
echo "INFO JWKS_URI is ${JWKS_URI}"

if [ "${JWKS_URI}" == "" ]; then
  echo ERROR Could not determine JWKS_URI
  exit 1
fi

curl "${JWKS_URI}" > /data/updated-jwks.json
if [ "$?" != "0" ]; then
  echo ERROR Could not download keys from ${JWKS_URI}
  exit 1
fi

echo Successfully downloaded keys, validating json...
jq < /data/updated-jwks.json > /dev/null #allow stderr so we can see any validation errors
if [ "$?" != "0" ]; then
  echo ERROR Downloaded JSON did not validate, leaving existing keys in place
  exit 1
fi

echo Validated OK, updating keys...
mv /data/updated-jwks.json /data/jwks.json

echo Done
exit 0