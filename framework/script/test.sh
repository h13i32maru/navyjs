#!/bin/bash

./script/build.sh
./script/build_test.sh

case "$1" in
    "travis" )
        ./node_modules/.bin/karma start test/karma.conf.js --browsers ChromeTravis
        ;;
    "safari" )
        ./node_modules/.bin/karma start test/karma.conf.js --browsers Safari
        ;;
    * )
        ./node_modules/.bin/karma start test/karma.conf.js
        ;;
esac
