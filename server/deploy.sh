#!/bin/sh
# Deploys the committed HEAD to the server: site files to /srv/wave-jail/site,
# server/ (compose, nginx, api) to ~/wave-production. Both are backed up first.
# Usage: server/deploy.sh [ssh target]    (needs the vadm_wave key)
set -e
TARGET=${1:-vadm@192.168.88.252}
SSH="ssh -i $HOME/.ssh/vadm_wave -o BatchMode=yes $TARGET"
cd "$(dirname "$0")/.."
STAMP=$(date +%Y%m%d-%H%M%S)

git archive --format=tar HEAD -- . ':!tests' ':!server' ':!SOUNDCLOUD_SETUP.md' | $SSH "
set -e
B=~/wave-backups/$STAMP; mkdir -p \$B/site \$B/production
cp -a /srv/wave-jail/site/. \$B/site/; cp -a ~/wave-production/. \$B/production/
S=\$(mktemp -d); tar -x -C \$S; test -f \$S/index.html
# The directory itself is bind-mounted into nginx, so only its contents are replaced.
find /srv/wave-jail/site -mindepth 1 -delete; cp -a \$S/. /srv/wave-jail/site/; rm -rf \$S
chmod -R a+rX /srv/wave-jail/site
echo backup: \$B"

git archive --format=tar HEAD server/compose.yaml server/nginx.conf server/api.py | $SSH "
set -e
S=\$(mktemp -d); tar -x -C \$S
docker run --rm -v \$S/server/nginx.conf:/etc/nginx/conf.d/default.conf:ro --add-host api:127.0.0.1 \
  sha256:cd5bb7ea510c50a90cf91cd2476640a4294cfaa32533f56c1710331a4850a0e5 nginx -t -q
cp \$S/server/compose.yaml \$S/server/nginx.conf \$S/server/api.py ~/wave-production/; rm -rf \$S
cd ~/wave-production && docker compose up -d --wait --wait-timeout 60 2>&1 | tail -4
curl -s -o /dev/null -w 'site %{http_code}\n' http://127.0.0.1:18080/
curl -s -w '\n' http://127.0.0.1:18080/api/health"
