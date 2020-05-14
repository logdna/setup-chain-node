#!/bin/bash

mkdir -p coverage
npm test -- -Rclassic -o coverage/out.tap --coverage-report text-summary \
  --coverage-report=html --no-browser

code=$?
cat coverage/out.tap | ./node_modules/.bin/tap-mocha-reporter xunit > coverage/package.xml
exit $code
