#!/bin/sh

set +x
set -e

cd client-ui && npm run build && cd ..
cp -r client-ui/dist/* build/

npm run bundle
cp server.js build/server.js
cp preload.js build/preload.js

cd build && npm run make && cd ..
