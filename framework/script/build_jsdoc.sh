#!/bin/bash

mkdir -p tmp

./node_modules/.bin/6to5 src -d tmp/src
./node_modules/.bin/jsdoc -c jsdoc.json

rm -rf tmp/src

echo doc/index.html
