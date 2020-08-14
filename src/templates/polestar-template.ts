import stringify from 'json-stringify-pretty-compact';
import {Template, GenWidget, Condition, Widget, ListWidget} from '../types';
import {Json, JsonMap} from '../types';
import {AUTHORS} from '../constants/index';
import {VEGA_CATEGORICAL_COLOR_SCHEMES, VEGA_CONT_COLOR_SCHEMES} from './vega-common';
import {toList} from './polestar-template-utils';
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

const injectCondition = (widget: GenWidget, condition: Condition): GenWidget => ({
  ...widget,
  conditions: [...widget.conditions, condition],
});

function aggregateConditional(key: string): JsonMap {
  // old version of the query left around
  // handling aggregate none case to reduce vega-lite errors proves to be pretty troublesome
  // const isNone = `parameters.${key}Agg === "\\"none\\""`;
  const isCount = `${key}.includes('COUNT')`;
  const filledIn = `${key}`;
  const isQuantitative = `${key}Type.includes('quantitative')`;
  const isNone = `${key}Agg.includes('none')`;

  return {
    $if: `!${isNone} && ${filledIn} && ${isQuantitative} || ${isCount}`,
    true: {$if: `${isCount}`, true: 'count', false: `[${key}Agg]`},
  };
}

function conditionalFieldName(key: string): JsonMap {
  return {
    $if: `${used(key)} && ${notCount(key)}`,
    true: {
      $if: `(${key}.includes('${META_COL_ROW}')) || (${key}.includes('${META_COL_COL}'))`,
      true: {repeat: `[${key}]`},
      false: `[${key}]`,
    },
  };
}

function zeroConditional(key: string): JsonMap {
  const notZero = `!${key}IncludeZero.includes('true')`;
  const isQuant = `${key}Type.includes('quantitative')`;
  const isCount = `${key}.includes('COUNT')`;
  return {
    $if: `${used(key)} && ${notZero} && (${isQuant} || ${isCount})`,
    true: `[${key}IncludeZero]`,
  };
}

function timeUnitCond(key: string): any {
  const isTemporal = `${key}Type.includes('temporal')`;
  const isNotNull = `!${key}TimeUnit.includes('null')`;
  return {
    $if: `${used(key)} && ${isTemporal} && ${isNotNull}`,
    true: `[${key}TimeUnit]`,
  };
}

function typeCond(key: string): any {
  return {
    $if: `${used(key)} && ${key}Type.includes('quantitative')`,
    true: `[${key}ScaleType]`,
  };
}

const renderObjectIf = (object: Json, query: string, fieldName: string): JsonMap => ({
  // [fieldName]: {$cond: {query, true: object}},
  [fieldName]: {$if: query, true: object},
});
const encoding = {
  ...['X', 'Y'].reduce((acc: JsonMap, key) => {
    const output = {
      field: conditionalFieldName(key),
      type: {
        $if: `${key}.includes('COUNT')`,
        true: 'quantitative',
        false: `[${key}Type]`,
      },
      aggregate: aggregateConditional(key),
      timeUnit: timeUnitCond(key),
      scale: {$if: notCount(key), true: {zero: zeroConditional(key), type: typeCond(key)}},
      // scale: {$cond: {query: notCount(key), true: {zero: zeroConditional(key), type: typeCond(key)}}},
    };
    return {
      ...acc,
      ...renderObjectIf(output, used(key), key.toLowerCase()),
    };
  }, {}),
  ...['Size', 'Color'].reduce((acc: JsonMap, key: string) => {
    const output = {
      field: conditionalFieldName(key),
      type: {
        $if: `${key}.includes('COUNT')`,
        true: 'quantitative',
        false: `[${key}Type]`,
      },
      aggregate: aggregateConditional(key),
      bin: {
        $if: `${key}Bin.includes('true') && ${key}Type.includes('quantitative')`,
        true: true,
      },
    } as any;
    if (key === 'Color') {
      output['scale'] = {
        $if: 'Color',
        true: {
          scheme: {
            $if: 'ColorType.includes("nominal") && !Color.includes("COUNT")',
            true: '[nominalColor]',
            false: '[quantColor]',
          },
        },
      };
    }
    return {...acc, ...renderObjectIf(output, used(key), key.toLowerCase())};
  }, {}),
  ...['Shape', 'Text', 'Detail'].reduce((acc: JsonMap, key: string) => {
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
const mark = {type: '[markType]', tooltip: true, opacity: '[opacity]'};
const PolestarBody: Json = {
  $schema: 'https:vega.github.io/schema/vega-lite/v4.json',
  transform: [] as JsonMap[],
  repeat: {
    $if: eitherMeta,
    true: {
      row: {$if: paramsInclude(META_COL_ROW), true: '[row]'},
      column: {$if: paramsInclude(META_COL_COL), true: '[column]'},
    },
  },
  encoding: {$if: `!(${eitherMeta})`, true: encoding},
  mark: {$if: `!(${eitherMeta})`, true: mark},
  spec: {$if: eitherMeta, true: {encoding, mark}},
  height: {$if: 'showHeight.includes("true")', true: '[height]'},
  width: {$if: 'showWidth.includes("true")', true: '[width]'},
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
  code: stringify(PolestarBody, {maxLength: 110}),
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
              query: `${key} && ${key}Type.includes('quantitative')`,
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
              query: `${key} && ${key}Type.includes('temporal')`,
            },
          ],
        },
        simpleSwitch({
          name: `${key}IncludeZero`,
          displayName: 'Include Zero',
          conditions: [simpleCondition(key)],
        }),
        makeAgg(key),
      ]);
    }, []),

    // Mark type
    makeSection('MarkDivider', []),
    simpleList({name: 'markType', list: toList(MARK_TYPES), defaultVal: toQuote('point')}),

    // size & color dimensions
    ...['Color', 'Size'].reduce((acc, key: string) => {
      const typeIsQuant = `${key}Type.includes('quantitative')`;
      const widgets = [
        makeDataTarget(key),
        makeTypeSelect(key, key === 'Color' ? 'nominal' : 'ordinal'),
        simpleSwitch({
          name: `${key}Bin`,
          conditions: [
            simpleCondition(key),
            {queryResult: 'show', query: `${notCount(key)} && ${typeIsQuant}`},
          ],
        }),
        makeAgg(key),
      ];
      if (key === 'Color') {
        widgets.push({
          name: 'opacity',
          type: 'Slider',
          config: {minVal: 0, maxVal: 1, step: 0.1, defaultValue: 0.8},
        } as any);
        widgets.push({
          type: 'List',
          name: 'nominalColor',
          displayName: 'Color Scheme',
          config: {
            allowedValues: VEGA_CATEGORICAL_COLOR_SCHEMES.map(toQuote),
            defaultValue: toQuote(VEGA_CATEGORICAL_COLOR_SCHEMES[10]),
          },
          conditions: [
            {query: '!Color', queryResult: 'hide'},
            {
              query: '!ColorType.includes("nominal") || Color.includes("COUNT")',
              queryResult: 'hide',
            },
          ],
        } as Widget<ListWidget>);
        widgets.push({
          type: 'List',
          name: 'quantColor',
          displayName: 'Color Scheme',
          config: {
            allowedValues: VEGA_CONT_COLOR_SCHEMES.map(toQuote),
            defaultValue: toQuote(VEGA_CONT_COLOR_SCHEMES[0]),
          },
          conditions: [
            {query: '!Color', queryResult: 'hide'},
            {
              query: 'ColorType.includes("nominal") && !Color.includes("COUNT")',
              queryResult: 'hide',
            },
          ],
        } as Widget<ListWidget>);
      }

      return acc.concat(widgets);
    }, [] as GenWidget[]),

    // size & detail dimensions\
    injectCondition(makeDataTarget('Shape'), {
      query: '!markType.includes("point")',
      queryResult: 'hide',
    }),
    injectCondition(makeTypeSelect('Shape', 'nominal'), {
      query: '!markType.includes("point")',
      queryResult: 'hide',
    }),

    makeDataTarget('Detail'),
    makeTypeSelect('Detail', 'nominal'),

    // text
    injectCondition(makeDataTarget('Text'), {
      query: '!markType.includes("text")',
      queryResult: 'hide',
    }),
    injectCondition(makeTypeSelect('Text', 'nominal'), {
      query: '!markType.includes("text")',
      queryResult: 'hide',
    }),
    injectCondition(makeAgg('Text'), {
      query: '!markType.includes("text")',
      queryResult: 'hide',
    }),

    // row / column
    makeSection('Facet Divider', []),
    injectCondition(makeText('Repeat Small Multiply', []), {query: eitherMeta, queryResult: 'hide'}),
    ...['Row', 'Column'].reduce(
      (acc: GenWidget[], key: string) =>
        acc.concat([injectCondition(makeDataTarget(key), {query: eitherMeta, queryResult: 'hide'})]),
      [],
    ),

    makeSection('View Controls', []),
    makeText('View Controls', []),
    simpleSwitch({
      name: `showHeight`,
      displayName: 'Specify Height',
      defaultsToActive: false,
    }),
    {
      name: 'height',
      type: 'Slider',
      config: {minVal: 20, maxVal: 800, step: 10, defaultValue: 100},
      conditions: [{query: '!showHeight.includes("true")', queryResult: 'hide'}],
    },
    simpleSwitch({name: `showWidth`, displayName: 'Specify Width', defaultsToActive: false}),
    {
      name: 'width',
      type: 'Slider',
      config: {minVal: 20, maxVal: 800, step: 10, defaultValue: 100},
      conditions: [{query: '!showWidth.includes("true")', queryResult: 'hide'}],
    },
  ],
};
export default Polestar;
