#!/bin/sh
export PATH="/tmp/node-v22.13.1-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev
