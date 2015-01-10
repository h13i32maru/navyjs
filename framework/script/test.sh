#!/bin/bash
# usage: test.sh [travis|safari]

./script/build.sh
./script/build_test.sh

type=$1

# npm version of travis is 1.4.
# npm@1.4 can not use `npm run test -- args`
# so need to use env variable.
if [ -n "$TRAVIS" ]
then
    type="travis"
fi

case "$type" in
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
