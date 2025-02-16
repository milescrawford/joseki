#!/bin/bash
set -e

aws s3 sync --delete --exclude aws.env --exclude Dockerfile --exclude README.md --exclude deploy.sh . s3://joseki.milescrawford.com/
