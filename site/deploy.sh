#!/bin/bash
set -e

terser -c -m -o joseki.js --timings -- joseki.js
aws s3 cp --cache-control max-age=86400 index.html s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=86400 edit/index.html s3://joseki.milescrawford.com/edit/
aws s3 cp --cache-control max-age=86400 about/index.html s3://joseki.milescrawford.com/about/
aws s3 cp --cache-control max-age=86400 login/index.html s3://joseki.milescrawford.com/login/
aws s3 cp --cache-control max-age=86400 style.css s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=86400 joseki.js s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=86400 wgo.min.js s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=86400 bootstrap.min.css s3://joseki.milescrawford.com/
aws s3 cp --cache-control max-age=86400 cat.png s3://joseki.milescrawford.com/
