#!/bin/bash
set -e

terser -c -m -o joseki.js --timings -- joseki.js
aws s3 cp --cache-control max-age=3600 index.html s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 edit/index.html s3://joseki.milescrawford.com/edit/
aws s3 cp --cache-control max-age=3600 about/index.html s3://joseki.milescrawford.com/about/
aws s3 cp --cache-control max-age=3600 login/index.html s3://joseki.milescrawford.com/login/
aws s3 cp --cache-control max-age=3600 style.css s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 joseki.js s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 wgo.min.js s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 bootstrap.min.css s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 cat.png s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 favicon.png s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 cat-logo.png s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=3600 manifest.json s3://joseki.milescrawford.com/
