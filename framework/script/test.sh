#!/bin/bash

./script/build.sh
./script/build_test.sh

if [ -n "$TRAVIS" ]
then
    ./node_modules/.bin/karma start test/karma.conf.js --browsers ChromeTravis
else
    ./node_modules/.bin/karma start test/karma.conf.js
fi
