#!/usr/bin/env bash

rm -rf ./dist/
mkdir ./dist/

cp ./package.json ./dist/package.json
cp ./readme.md ./dist/readme.md

./node_modules/.bin/tsc

cd ./dist/
npm pack
