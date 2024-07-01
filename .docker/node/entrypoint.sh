#!/bin/bash

echo "Container Started"

mkdir -p tmp/export

npm install --legacy-peer-deps

npm run start:debug