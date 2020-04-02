import stringify from 'json-stringify-pretty-compact';
import {Template, GenWidget, Condition} from '../types';
import {Json, JsonMap} from '../types';
import {AUTHORS} from '../constants/index';

import {toList} from '../utils';
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
  simpleCondition,
  toQuote,
  used,
} from './polestar-template-utils';

const PRIMITVES = ['AREA', 'BAR', 'CIRCLE', 'LINE', 'POINT', 'RECT', 'SQUARE', 'TEXT', 'TICK', 'TRAIL'];
const MARK_TYPES = PRIMITVES.map(x => x.toLowerCase());

const META_COL_ROW = 'row';
const META_COL_COL = 'column';
const paramsInclude = (key: string): string => `Object.values(parameters).includes('\\"${key}\\"')`;
const eitherMeta = `${paramsInclude(META_COL_ROW)} || ${paramsInclude(META_COL_COL)}`;
const USING_META_COLS_CONDITION: Condition = {queryResult: 'show', query: eitherMeta};

function aggregateConditional(key: string): JsonMap {
  // old version of the query left around
  // handling aggregate none case to reduce vega-lite errors proves to be pretty troublesome
  // const isNone = `parameters.${key}Agg === "\\"none\\""`;
  const isCount = `parameters.${key}.includes('COUNT')`;
  const filledIn = `parameters.${key}`;
  const isQuantitative = `parameters.${key}Type.includes('quantitative')`;

  return {
    $cond: {
      // query: `${isCount} || (${filledIn} && !${isNone})`,
      query: `${filledIn} && ${isQuantitative}`,
      true: {$cond: {query: `${isCount}`, true: 'count', false: `[${key}Agg]`}},
    },
  };
}

function conditionalFieldName(key: string): JsonMap {
  return {
    $cond: {
      query: `${used(key)} && ${notCount(key)}`,
      true: {
        $cond: {
          query: `(parameters.${key}.includes('${META_COL_ROW}')) || (parameters.${key}.includes('${META_COL_COL}'))`,
          true: {repeat: `[${key}]`},
          false: `[${key}]`,
        },
      },
    },
  };
}

function zeroConditional(key: string): JsonMap {
  const notZero = `!parameters.${key}IncludeZero.includes('true')`;
  const isQuant = `parameters.${key}Type.includes('quantitative')`;
  return {
    $cond: {
      query: `${used(key)} && ${notZero} &&${isQuant}`,
      // query: `${used(key)} && ${includeZero} && ${isQuant}`,
      true: `[${key}IncludeZero]`,
    },
  };
}

function timeUnitCond(key: string): any {
  const isTemporal = `parameters.${key}Type.includes('temporal')`;
  const isNotNull = `!parameters.${key}TimeUnit.includes('null')`;
  return {
    $cond: {query: `${used(key)} && ${isTemporal} && ${isNotNull}`, true: `[${key}TimeUnit]`},
  };
}

function typeCond(key: string): any {
  return {
    $cond: {
      query: `${used(key)} && parameters.${key}Type.includes('quantitative')`,
      true: `[${key}ScaleType]`,
    },
  };
}

const renderObjectIf = (object: Json, query: string, fieldName: string): JsonMap => ({
  [fieldName]: {$cond: {query, true: object}},
});
const encoding = {
  ...['X', 'Y'].reduce((acc: JsonMap, key) => {
    const output = {
      field: conditionalFieldName(key),
      type: `[${key}Type]`,
      aggregate: aggregateConditional(key),
      timeUnit: timeUnitCond(key),
      scale: {$cond: {query: notCount(key), true: {zero: zeroConditional(key), type: typeCond(key)}}},
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
        row: {$cond: {query: paramsInclude(META_COL_ROW), true: '[row]'}},
        column: {$cond: {query: paramsInclude(META_COL_COL), true: '[column]'}},
      },
    },
  },
  encoding: {$cond: {query: `!(${eitherMeta})`, true: encoding}},
  mark: {$cond: {query: `!(${eitherMeta})`, true: mark}},
  spec: {$cond: {query: eitherMeta, true: {encoding, mark}}},
};

const Polestar: Template = {
  templateName: 'Polestar',
  templateDescription:
    'A tableau-style shelf builder, facilitates a wide variety of charting and exploration tasks.',
  templateLanguage: 'vega-lite',
  templateAuthor: AUTHORS,
  customCards: [
    {name: 'COUNT', description: 'use this card to treat channels as simple count aggregations'},
    {name: META_COL_ROW, description: 'place this card onto fields to facet across by data column'},
    {name: META_COL_COL, description: 'place this card onto fields to facet across by data column'},
  ],
  code: stringify(PolestarBody),
  widgets: [
    makeSection('Meta Columns Section', [USING_META_COLS_CONDITION]),
    makeText('Meta Columns', [USING_META_COLS_CONDITION]),
    makeMultiTarget({
      dim: META_COL_ROW,
      conditions: [{queryResult: 'show', query: paramsInclude(META_COL_ROW)}],
    }),
    makeMultiTarget({
      dim: META_COL_COL,
      conditions: [{queryResult: 'show', query: paramsInclude(META_COL_COL)}],
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
          conditions: [
            simpleCondition(key),
            {
              queryResult: 'show',
              query: `parameters.${key} && parameters.${key}Type.includes('quantitative')`,
            },
          ],
        }),
        {
          name: `${key}TimeUnit`,
          type: 'List',
          displayName: 'Scale type',
          config: {
            allowedValues: ['yearmonth', 'year', 'month', 'day', 'hour', 'minute', 'null'].map(toQuote),
            defaultValue: toQuote('null'),
          },
          conditions: [
            simpleCondition(key),
            {
              queryResult: 'show' as any,
              query: `parameters.${key} && parameters.${key}Type.includes('temporal')`,
            },
          ],
        },
        simpleSwitch({
          name: `${key}IncludeZero`,
          displayName: 'Include Zero',
          conditions: [simpleCondition(key)],
        }),
        simpleSwitch({
          name: `${key}bin`,
          displayName: 'Bin',
          conditions: [simpleCondition(key), {queryResult: 'hide', query: `!${notCount(key)}`}],
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
          conditions: [simpleCondition(key), {queryResult: 'hide', query: `!${notCount(key)}`}],
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
