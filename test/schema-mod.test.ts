import {modifyJSONSchema} from '../src/hydra-lang';

import Ajv from 'ajv';
import polestarTemplate from '../src/templates/example-templates/polestar-template';
/* eslint-disable @typescript-eslint/no-var-requires */
import {writeFile} from 'hoopoe';
const draft6Schema = require('ajv/lib/refs/json-schema-draft-06.json');
const vegaLiteSchema = require('vega-lite/build/vega-lite-schema.json');
const unitVisSchema = require('unit-vis/unit-vis-schema.json');
/* eslint-enable @typescript-eslint/no-var-requires */
// const valid = ajv.validate(vegaLiteSchema, polestarTemplate.code);
const ajv = new Ajv({
  allErrors: true,
  verbose: false,
  format: 'uri-reference',
  extendRefs: 'fail',
  schemaId: 'auto', // for draft 04 and 06 schemas
  validateSchema: true,
});
ajv.addMetaSchema(draft6Schema);
ajv.addFormat('color-hex', () => true);

const COMMON = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  description: 'A simple bar chart with embedded data.',
  data: {
    values: [
      {a: 'A', b: 28},
      {a: 'B', b: 55},
      {a: 'C', b: 43},
      {a: 'D', b: 91},
      {a: 'E', b: 81},
      {a: 'F', b: 53},
      {a: 'G', b: 19},
      {a: 'H', b: 87},
      {a: 'I', b: 52},
    ],
  },
};

const EXAMPLE_VL_SCHEMA = {
  ...COMMON,
  fuck: 'this',
  mark: 'bar',
  encoding: {
    x: {field: 'a', type: 'ordinal'},
    y: {field: 'b', type: 'quantitative'},
  },
};

const EXAMPLE_VL_SCHEMA_MODIFIED_CONDITIONAL: any = {
  ...COMMON,
  mark: 'bar',
  encoding: {
    x: {
      field: {
        CONDITIONAL: {
          query: 'parameters.x',
          true: '[X]',
          //   false: null,
        },
      },
      type: 'quantitative',
    },
    y: {field: 'b', type: 'quantitative'},
  },
};

const EXAMPLE_VL_SCHEMA_MODIFIED_INTERPOLANT: any = {
  ...COMMON,
  mark: 'bar',
  encoding: {
    x: {field: 'a', type: '[xType]'},
    y: {field: 'b', type: '[yType]'},
  },
};

const UNIT_VIS_EXAMPLE = {
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
  fuck: 'this',
  data: {url: 'data/titanic3.csv'},
  layouts: [{subgroup: {type: 'flatten'}}],
  mark: {color: {key: 'survived_text', type: 'categorical'}},
};

test('#modifyJSONSchema', async function() {
  //   const uvSchema = modifyJSONSchema(unitVisSchema);
  //   console.log(JSNuvSchema);
  // catches unused invalid top level key
  //   const validity1 = ajv.validate(unitVisSchema, UNIT_VIS_EXAMPLE);
  //   expect(validity1).toBe(true);
  //   expect(ajv.errors).toMatchSnapshot();

  const vlSchema = modifyJSONSchema(vegaLiteSchema);
  console.log(JSON.stringify(vlSchema, null, 2));
  // catches unused invalid top level key
  const validity1 = ajv.validate(vlSchema, EXAMPLE_VL_SCHEMA);
  //   console.log(ajv.errors);
  expect(validity1).toBe(false);
  expect(ajv.errors).toMatchSnapshot();

  // doesnt invalidate interpolants
  const validity2 = ajv.validate(vlSchema, EXAMPLE_VL_SCHEMA_MODIFIED_INTERPOLANT);
  expect(validity2).toBe(true);
  expect(ajv.errors).toBe(null);

  // doesnt invalidate conditionals
  const validity3 = ajv.validate(vlSchema, EXAMPLE_VL_SCHEMA_MODIFIED_CONDITIONAL);
  expect(validity3).toBe(true);
  expect(ajv.errors).toBe(null);
});
