#!/bin/bash

mkdir -p tmp
cp -af src tmp/

for file in $(find src -name '*.js')
do
    # remove unsupported ES6 feature with node.
    cat $file |
     sed 's/export\( default\)*//' | # 'export default' => ''
     sed 's/\(([^()]*)\) *=>/function\1/' | # '(a, b)=>' => 'function(a, b)'
     sed 's/^\( *import\)/\/\/\1/' > tmp/$file # 'import a from "a"' => '//import a from "a"'
done

node --harmony ./node_modules/.bin/jsdoc -c jsdoc.json -r tmp/src -d doc

rm -rf tmp/src

echo doc/index.html
