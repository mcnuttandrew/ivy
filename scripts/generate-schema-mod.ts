import {modifyJSONSchema} from '../src/ivy-lang';
import {promises as fs} from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const json = require('vega-lite/build/vega-lite-schema.json');
fs.writeFile('./assets/schema-mod.json', JSON.stringify(modifyJSONSchema(json), null, 2));
