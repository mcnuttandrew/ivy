#!/usr/bin/env node
const args = process.argv.slice(2);
console.log(args);

import {promises as fs} from 'fs';

fs.getFile(args[0])
  // getFile(args[0])
  .then(d => JSON.parse(d))
  .then(d => {
    d.$ref = '#/definitions/Template';
    fs.writeFile(args[0], JSON.stringify(d, null, 2));
  });
