const {writeFile} = require('hoopoe');
import {modifyJSONSchema} from '../src/ivy-lang';

// eslint-disable-next-line @typescript-eslint/no-var-requires
writeFile(
  './assets/schema-mod.json',
  JSON.stringify(modifyJSONSchema(require('vega-lite/build/vega-lite-schema.json')), null, 2),
);
