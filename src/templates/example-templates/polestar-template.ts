import stringify from 'json-stringify-pretty-compact';
import {Template, TemplateWidget, WidgetSubType, WidgetValidation} from '../types';
import {toList} from '../../utils';
import {
  makeDataTarget,
  makeText,
  makeSection,
  simpleList,
  simpleSwitch,
  addValidation,
  used,
  unused,
  toQuote,
  makeFullAgg,
  makeSimpleAgg,
  makeTypeSelect,
} from './polestar-template-utils';

const MARK_TYPES = [
  'AREA',
  'BAR',
  'CIRCLE',
  'LINE',
  'POINT',
  'RECT',
  'SQUARE',
  'TEXT',
  'TICK',
  'TRAIL',
].map(x => x.toLowerCase());

const renderObjectIf = (object: any, query: string, fieldName: string): any => ({
  [fieldName]: {CONDITIONAL: {query, true: object, deleteKeyOnFalse: true}},
});
// : used(checkKey)
const shelfProgram: any = {
  $schema: 'https:vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
  encoding: {
    // TODO: delete field if not present
    ...['X', 'Y'].reduce((acc: any, key) => {
      return {
        ...acc,
        [key.toLowerCase()]: {
          field: {CONDITIONAL: {true: `[${key}]`, deleteKeyOnFalse: true, query: used(key)}},
          type: `[${key}Type]`,
          scale: {
            // zero: `[${key}IncludeZero]`,
            zero: {CONDITIONAL: {query: used(key), true: `[${key}IncludeZero]`, deleteKeyOnFalse: true}},
            type: {CONDITIONAL: {query: used(key), true: `[${key}ScaleType]`, deleteKeyOnFalse: true}},
            // CONDITIONAL: {true: {zero: `[${key}IncludeZero]`}, false: null, query: used(key)}
          },
        },
      };
    }, {}),
    // y: {field: '[Y]', type: '[YType]', scale: {zero: '[YIncludeZero]'}},
    ...renderObjectIf({field: '[Size]', type: '[SizeType]'}, used('Size'), 'size'),
    ...renderObjectIf(
      {
        field: {
          CONDITIONAL: {
            query: 'parameters.Color',
            true: '[Color]',
            deleteKeyOnFalse: true,
          },
        },
        type: '[ColorType]',
        // aggregate: '[ColorAggregate]'
        aggregate: {
          CONDITIONAL: {
            query:
              '(parameters.Color && parameters.ColorAggFull !== "none") || (!parameters.Color && parameters.ColorAggSimple !== "none")',
            true: {
              CONDITIONAL: {query: 'parameters.Color', true: '[ColorAggFull]', false: '[ColorAggSimple]'},
            },
            deleteKeyOnFalse: true,
          },
        },
      },
      'parameters.Color || (parameters.ColorAggSimple !== "\\"none\\"")',
      'color',
    ),
    ...renderObjectIf({field: '[Shape]', type: '[ShapeType]'}, used('Shape'), 'shape'),
    ...renderObjectIf({field: '[Text]', type: '[TextType]'}, used('Text'), 'text'),
    ...renderObjectIf({field: '[Detail]', type: '[DetailType]'}, used('Detail'), 'detail'),
    ...['Row', 'Column'].reduce((acc, key) => {
      const newObj = renderObjectIf({field: `[${key}]`, type: 'nominal'}, used(key), key.toLowerCase());
      return {...acc, ...newObj};
    }, {}),
  },
  mark: {type: '[markType]', tooltip: true},
};

const SHELF: Template = {
  templateName: 'Polestar',
  templateDescription: 'A tablea-style shelf builder',
  templateLanguage: 'vega-lite',
  templateAuthor: 'BUILT_IN',
  code: stringify(shelfProgram),
  widgets: [
    // x & y dimensions
    makeSection('Encoding header'),
    makeText('Encoding'),
    ...['X', 'Y'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'quantitative'),
        simpleList({
          widgetName: `${key}ScaleType`,
          list: ['linear', 'log'],
          displayName: 'Scale type',
          defaultVal: toQuote('linear'),
        }),
        simpleSwitch({widgetName: `${key}IncludeZero`, displayName: 'Include Zero'}),
        simpleSwitch({widgetName: `${key}bin`, displayName: 'Bin'}),
        makeFullAgg(key),
        makeSimpleAgg(key),
      ]);
    }, []),

    // Mark type
    makeSection('MarkDivider'),
    simpleList({widgetName: 'markType', list: toList(MARK_TYPES), defaultVal: toQuote('circle')}),

    // size & color dimensions
    ...['Color', 'Size'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'ordinal'),
        simpleSwitch({widgetName: `${key}bin`}),
        makeFullAgg(key),
        makeSimpleAgg(key),
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key), makeTypeSelect(key, 'nominal')]);
    }, []),
    // text
    makeDataTarget('Text'),
    makeTypeSelect('Text', 'nominal'),
    makeFullAgg('Text'),
    makeSimpleAgg('Text'),

    // row / column
    makeSection('Facet Divider'),
    makeText('Repeat Small Multiply'),
    ...['Row', 'Column'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key)]);
    }, []),
  ],
  widgetValidations: [
    ...['X', 'Y'].reduce((acc: WidgetValidation[], key: string) => {
      [`${key}Type`, `${key}ScaleType`, `${key}IncludeZero`, `${key}bin`].forEach(addValidation(acc, key));
      return acc;
    }, []),

    ...['Color', 'Size'].reduce((acc: WidgetValidation[], key: string) => {
      [`${key}Type`, `${key}bin`].forEach(addValidation(acc, key));
      return acc;
    }, []),

    ...['Shape', 'Detail'].reduce((acc: WidgetValidation[], key: string) => {
      [`${key}Type`].forEach(addValidation(acc, key));
      return acc;
    }, []),
    // simple and full aggregate are paired
    ...['X', 'Y', 'Size', 'Color'].reduce((acc, key) => {
      return acc.concat([
        {queryTarget: `${key}AggFull`, query: unused(key), queryResult: 'hide'},
        {queryTarget: `${key}AggSimple`, query: used(key), queryResult: 'hide'},
      ]);
    }, []),
  ],
};
export default SHELF;
