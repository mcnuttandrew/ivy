import stringify from 'json-stringify-pretty-compact';
import {Template, GenWidget, Validation} from '../types';
import {Json, JsonMap} from '../../types';

import {toList} from '../../utils';
import {
  makeAgg,
  makeDataTarget,
  makeMultiTarget,
  makeSection,
  makeText,
  makeTypeSelect,
  notCount,
  simpleList,
  simpleSwitch,
  simpleValidation,
  toQuote,
  used,
} from './polestar-template-utils';

const PRIMITVES = ['AREA', 'BAR', 'CIRCLE', 'LINE', 'POINT', 'RECT', 'SQUARE', 'TEXT', 'TICK', 'TRAIL'];
const MARK_TYPES = PRIMITVES.map(x => x.toLowerCase());

const META_COL_ROW = 'row';
const META_COL_COL = 'column';
const paramsInclude = (key: string): string => `Object.values(parameters).includes('\\"${key}\\"')`;
const eitherMeta = `${paramsInclude(META_COL_ROW)} || ${paramsInclude(META_COL_COL)}`;
const USING_META_COLS_VALIDATION: Validation = {queryResult: 'show', query: eitherMeta};

function aggregateConditional(key: string): JsonMap {
  const isNone = `parameters.${key}Agg === "\\"none\\""`;
  const isCount = `parameters.${key} === "\\"COUNT\\""`;
  const filledIn = `parameters.${key}`;

  return {
    $cond: {
      query: `${isCount} || (${filledIn} && ${!isNone})`,
      true: {$cond: {query: `${isCount}`, true: 'count', false: `[${key}Agg]`}},
      deleteKeyOnFalse: true,
    },
  };
}

function conditionalFieldName(key: string): JsonMap {
  return {
    $cond: {
      query: `${used(key)} && ${notCount(key)}`,
      deleteKeyOnFalse: true,
      true: {
        $cond: {
          query: `(parameters.${key} === '\\"${META_COL_ROW}\\"') || (parameters.${key} === '\\"${META_COL_COL}\\"')`,
          true: {repeat: `[${key}]`},
          false: `[${key}]`,
        },
      },
    },
  };
}

function zeroConditional(key: string): JsonMap {
  return {
    $cond: {
      query: `${used(key)} && parameters.${key}IncludeZero && parameters.${key}Agg === "\\"quantitative\\""`,
      true: `[${key}IncludeZero]`,
      deleteKeyOnFalse: true,
    },
  };
}

const renderObjectIf = (object: Json, query: string, fieldName: string): JsonMap => ({
  [fieldName]: {$cond: {query, true: object, deleteKeyOnFalse: true}},
});
const encoding = {
  ...['X', 'Y'].reduce((acc: JsonMap, key) => {
    const output = {
      field: conditionalFieldName(key),
      type: `[${key}Type]`,
      aggregate: aggregateConditional(key),
      scale: {
        $cond: {
          query: notCount(key),
          true: {
            zero: zeroConditional(key),
            type: {
              $cond: {
                query: `${used(key)} && parameters.${key}Type ===  "\\"quantitative\\""`,
                true: `[${key}ScaleType]`,
                deleteKeyOnFalse: true,
              },
            },
          },
          deleteKeyOnFalse: true,
        },
      },
    };
    return {
      ...acc,
      ...renderObjectIf(output, used(key), key.toLowerCase()),
    };
  }, {}),
  ...['Size', 'Color', 'Shape', 'Text', 'Detail'].reduce((acc: JsonMap, key: string) => {
    const output = {
      field: conditionalFieldName(key),
      type: `[${key}Type]`,
      aggregate: aggregateConditional(key),
    };
    return {...acc, ...renderObjectIf(output, used(key), key.toLowerCase())};
  }, {}),
  ...['Row', 'Column'].reduce((acc, key) => {
    const newObj = renderObjectIf({field: `[${key}]`, type: 'nominal'}, used(key), key.toLowerCase());
    return {...acc, ...newObj};
  }, {}),
};
const mark = {type: '[markType]', tooltip: true};
const PolestarBody: Json = {
  $schema: 'https:vega.github.io/schema/vega-lite/v4.json',
  transform: [] as JsonMap[],
  repeat: {
    $cond: {
      query: eitherMeta,
      true: {
        row: {
          $cond: {
            query: paramsInclude(META_COL_ROW),
            true: '[row]',
            deleteKeyOnFalse: true,
          },
        },
        column: {
          $cond: {
            query: paramsInclude(META_COL_COL),
            true: '[column]',
            deleteKeyOnFalse: true,
          },
        },
      },
      deleteKeyOnFalse: true,
    },
  },
  encoding: {$cond: {query: `!(${eitherMeta})`, true: encoding, deleteKeyOnFalse: true}},
  mark: {$cond: {query: `!(${eitherMeta})`, true: mark, deleteKeyOnFalse: true}},
  spec: {$cond: {query: eitherMeta, true: {encoding, mark}, deleteKeyOnFalse: true}},
};

const Polestar: Template = {
  templateName: 'Polestar',
  templateDescription:
    'A tableau-style shelf builder, facilitates a wide variety of charting and exploration tasks.',
  templateLanguage: 'vega-lite',
  templateAuthor: 'HYDRA-AUTHORS',
  customCards: [
    {name: 'COUNT', description: 'use this card to treat channels as simple count aggregations'},
    {name: META_COL_ROW, description: 'place this card onto fields to facet across by data column'},
    {name: META_COL_COL, description: 'place this card onto fields to facet across by data column'},
  ],
  code: stringify(PolestarBody),
  widgets: [
    makeSection('Meta Columns Section', [USING_META_COLS_VALIDATION]),
    makeText('Meta Columns', [USING_META_COLS_VALIDATION]),
    makeMultiTarget({
      dim: META_COL_ROW,
      validations: [{queryResult: 'show', query: paramsInclude(META_COL_ROW)}],
    }),
    makeMultiTarget({
      dim: META_COL_COL,
      validations: [{queryResult: 'show', query: paramsInclude(META_COL_COL)}],
    }),

    // x & y dimensions
    makeSection('Encoding header', []),
    makeText('Encoding', []),
    ...['X', 'Y'].reduce((acc: GenWidget[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'quantitative'),
        simpleList({
          name: `${key}ScaleType`,
          list: ['linear', 'log'],
          displayName: 'Scale type',
          defaultVal: toQuote('linear'),
          validations: [
            simpleValidation(key),
            {
              queryResult: 'show',
              query: `parameters.${key} && parameters.${key}Type === "\\"quantitative\\""`,
            },
          ],
        }),
        simpleSwitch({
          name: `${key}IncludeZero`,
          displayName: 'Include Zero',
          validations: [simpleValidation(key)],
        }),
        simpleSwitch({
          name: `${key}bin`,
          displayName: 'Bin',
          validations: [simpleValidation(key), {queryResult: 'hide', query: `!${notCount(key)}`}],
        }),
        makeAgg(key),
      ]);
    }, []),

    // Mark type
    makeSection('MarkDivider', []),
    simpleList({name: 'markType', list: toList(MARK_TYPES), defaultVal: toQuote('circle')}),
    {
      type: 'Shortcut',
      name: 'main-shortcuts',
      config: {
        shortcuts: [
          {
            label: 'SWAP X & Y',
            shortcutFunction:
              "Object.keys(parameters).reduce((acc, d) => ({...acc, [d[0] === 'X' ? `Y${d.slice(1)}` : d[0] === 'Y' ? `X${d.slice(1)}` : d]: parameters[d]}), {})",
          },
        ],
      },
    },

    // size & color dimensions
    ...['Color', 'Size'].reduce((acc: GenWidget[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'ordinal'),
        simpleSwitch({
          name: `${key}bin`,
          validations: [simpleValidation(key), {queryResult: 'hide', query: `!${notCount(key)}`}],
        }),
        makeAgg(key),
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: GenWidget[], key: string) => {
      return acc.concat([makeDataTarget(key), makeTypeSelect(key, 'nominal')]);
    }, []),
    // text
    makeDataTarget('Text'),
    makeTypeSelect('Text', 'nominal'),
    makeAgg('Text'),

    // row / column
    makeSection('Facet Divider', []),
    makeText('Repeat Small Multiply', []),
    ...['Row', 'Column'].reduce((acc: GenWidget[], key: string) => acc.concat([makeDataTarget(key)]), []),
  ],
};
export default Polestar;
