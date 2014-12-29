#!/bin/bash

./node_modules/.bin/traceur --out build/test/all_test.js $(find test/ -name '*_test.js')
./node_modules/.bin/espower build/test/all_test.js > build/test/espowered_all_test.js

if [ -n "$TRAVIS" ]
then
    ./node_modules/.bin/karma start test/karma.conf.js --browsers ChromeTravis
else
    ./node_modules/.bin/karma start test/karma.conf.js
fi
