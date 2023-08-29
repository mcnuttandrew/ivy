// Cribbed from vega-editor
import * as stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
// import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {mergeDeep} from 'vega-lite/build/src/util';
import {modifyJSONSchema} from '../ivy-lang';

import vlSchema from 'vega-lite/build/vega-lite-schema.json';
import vSchema from 'vega/build/vega-schema.json';
import ivySchema from '../../assets/ivy.json';
import unitVisSchema from 'unit-vis/unit-vis-schema.json';

import {loader} from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

/**
 * Adds markdownDescription props to a schema. See https://github.com/Microsoft/monaco-editor/issues/885
 */
function addMarkdownProps(value: any): any {
  if (typeof value === 'object' && value !== null) {
    if (value.description) {
      value.markdownDescription = value.description;
    }

    for (const key in value) {
      /* eslint-disable */
      if (value.hasOwnProperty(key)) {
        value[key] = addMarkdownProps(value[key]);
      }
      /* eslint-enable */
    }
  }
  return value;
}

/* eslint-disable @typescript-eslint/no-var-requires */
const vegaLiteSchema = modifyJSONSchema(vlSchema);
const vegaSchema = modifyJSONSchema(vSchema);
// const ivySchema = ivySchema;
// const unitVisSchema = require('unit-vis/unit-vis-schema.json');
/* eslint-enable @typescript-eslint/no-var-requires */
addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);
addMarkdownProps(ivySchema);

const schemas = [
  {
    schema: vegaSchema,
    uri: 'https://vega.github.io/schema/vega/v5.json',
  },
  {
    schema: vegaLiteSchema,
    uri: 'https://vega.github.io/schema/vega-lite/v4.json',
  },
  {
    schema: unitVisSchema,
    uri: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
  },
  {
    schema: ivySchema,
    uri: 'https://ivy-vis.netlify.com/assets/ivy.json',
  },
  {
    schema: mergeDeep({}, vegaLiteSchema, {
      $ref: '#/definitions/Config',
      definitions: {
        Config: {
          properties: {
            $schema: {
              type: 'string',
            },
          },
        },
      },
    }),
    uri: 'https://vega.github.io/schema/vega-lite/v4.json#Config',
  },
  {
    schema: {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'object',
    },
    uri: 'https://vega.github.io/schema/vega/v5.json#Config',
  },
];

export default function setupMonaco() {
  loader.init().then((monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      comments: 'warning',
      trailingCommas: 'warning',
      enableSchemaRequest: true,
      schemas,
      validate: true,
    });

    monaco.languages.json.jsonDefaults.setModeConfiguration({
      documentFormattingEdits: false,
      documentRangeFormattingEdits: false,
      completionItems: true,
      hovers: true,
      documentSymbols: true,
      tokens: true,
      colors: true,
      foldingRanges: true,
      diagnostics: true,
    });

    monaco.languages.registerDocumentFormattingEditProvider('json', {
      provideDocumentFormattingEdits(
        model: Monaco.editor.ITextModel,
        options: Monaco.languages.FormattingOptions,
        token: Monaco.CancellationToken,
      ): Monaco.languages.TextEdit[] {
        return [
          {
            range: model.getFullModelRange(),
            text: stringify(parseJSONC(model.getValue())),
          },
        ];
      },
    });
  });
}
