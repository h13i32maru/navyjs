#!/bin/bash

for file in $(find sample/ -name '*.js' -and -not -name 'es5*')
do
    name=$(basename $file)
    dir=$(dirname $file)
    out=$dir/es5_$name
    ./node_modules/.bin/traceur --out $out $file
done
