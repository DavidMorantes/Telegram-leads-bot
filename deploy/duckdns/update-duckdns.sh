#!/bin/sh
set -e

if [ -z "$DUCKDNS_DOMAIN" ] || [ -z "$DUCKDNS_TOKEN" ]; then
  echo "DUCKDNS_DOMAIN and DUCKDNS_TOKEN are required"
  exit 1
fi

curl -fsSL "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip="
echo
