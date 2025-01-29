#!/bin/bash
set -e

terser -c -m -o joseki.js --timings -- joseki.js
aws s3 sync --delete --exclude aws.env --exclude Dockerfile --exclude README.md --exclude deploy.sh . s3://joseki.milescrawford.com/
