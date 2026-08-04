#!/bin/bash
# Runs on the server after each deploy (see .cpanel.yml). Backgrounded from
# there so the deploy hook itself returns immediately — npm install/build
# previously timed out cPanel's deploy hook when run inline (see git log).
#
# Check progress: tail -f /home/vibehyr/vibehyr.com/build.log
# When it finishes, restart the app in cPanel's Setup Node.js App screen.

set -e
cd /home/vibehyr/vibehyr.com
source /home/vibehyr/nodevenv/vibehyr.com/20/bin/activate
npm install

# Low-memory host: cap V8's heap so the compiler leaves headroom for
# native/WASM allocations instead of exhausting all available memory
# right before one of them. 1024 is the lowest value that built this
# app successfully in testing — 512 OOM'd outright, so don't go lower
# without re-testing. Raise it if the host has more RAM to spare, or
# if pages/content grow enough that 1024 stops being enough.
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build
