#!/usr/bin/env node
const args = process.argv.slice(2);
console.log(args);

const {getFile, writeFile} = require('hoopoe');

getFile(args[0])
  .then(d => JSON.parse(d))
  .then(d => {
    d.$ref = '#/definitions/Template';
    writeFile(args[0], JSON.stringify(d, null, 2));
  });
