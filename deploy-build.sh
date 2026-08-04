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
npm run build
