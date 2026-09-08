#!/usr/bin/env bash
set -euo pipefail

: "${LEGEND_DEPLOY_SHA:?LEGEND_DEPLOY_SHA is required}"

REPOSITORY="$(node -e 'const p=require("./data/project.json");process.stdout.write(p.repository)')"
ARCHIVE="https://github.com/${REPOSITORY}/archive/${LEGEND_DEPLOY_SHA}.tar.gz"

curl -L --fail --silent --show-error "$ARCHIVE" -o /tmp/legend.tar.gz
tar -xzf /tmp/legend.tar.gz --strip-components=1
npm install --global npm@11.6.0
npm ci
VITE_LEGEND_GIT_REF="$LEGEND_DEPLOY_SHA" npm run build
