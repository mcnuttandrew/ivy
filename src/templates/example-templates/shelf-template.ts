import stringify from 'json-stringify-pretty-compact';
import {
  Template,
  DataTargetWidget,
  MultiDataTargetWidget,
  ListWidget,
  SwitchWidget,
  TextWidget,
  SliderWidget,
  TemplateWidget,
  DataType,
  WidgetSubType,
} from '../types';
import {toList} from '../../utils';
const toQuote = (x: string): string => `"${x}"`;
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
const ALLDATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'METACOLUMN', 'TIME'];
const VegaLiteDataTypes = ['nominal', 'ordinal', 'quantitative', 'temporal'];
// TODO bin is handled incorrectly

const justCountAgg = toList(['none', 'count'].map(toQuote));
justCountAgg[0].value = undefined;
const spatialAggs = [
  ...justCountAgg,
  ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode'].map(toQuote)),
];

const renderObjectIf = (object: any, checkKey: string, fieldName: string): any =>
  `[${checkKey}]` ? {[fieldName]: object} : {};
// const usingMetaColumn = ['X', 'Y', 'Size', 'Color', 'Shape', 'Detail'].some(key => {
//     return typeof parameters[key] === 'object';
// })

const encoding = {
  x: {field: '[X]', type: '[XType]', scale: {zero: '[XIncludeZero]'}},
  y: {field: '[Y]', type: '[YType]', scale: {zero: '[YIncludeZero]'}},
  ...renderObjectIf({field: '[Size]', type: '[SizeType]'}, 'Size', 'size'),
  ...renderObjectIf({field: '[Color]', type: '[ColorType]'}, 'Color', 'color'),
  ...renderObjectIf({field: '[Shape]', type: '[ShapeType]'}, 'Shape', 'shape'),
  ...renderObjectIf({field: '[Text]', type: '[TextType]'}, 'Text', 'text'),
  ...renderObjectIf({field: '[Detail]', type: '[DetailType]'}, 'Detail', 'detail'),
  ...['Row', 'Column'].reduce((acc, key) => {
    const newObj = renderObjectIf({field: `[${key}]`, type: 'nominal'}, key, key.toLowerCase());
    return {...acc, ...newObj};
  }, {}),
};
const shelfProgram = {
  $schema: 'https:vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
  encoding,
  mark: {type: '', tooltip: true},
};

const makeDataTarget = (dim: string): TemplateWidget<DataTargetWidget> => ({
  widgetName: dim,
  widgetType: 'DataTarget',
  widget: {allowedTypes: ALLDATA_TYPES, required: false},
});

type displayType = {display: any; value: any};
interface SimpleListType {
  widgetName: string;
  list: string[] | displayType[];
  defaultVal?: string;
  displayName?: string;
}
const simpleList = ({
  widgetName,
  list,
  defaultVal,
  displayName,
}: SimpleListType): TemplateWidget<ListWidget> => {
  const firstDisplayValue = (list[0] as displayType).display;
  return {
    widgetName,
    widgetType: 'List',
    displayName: displayName || null,
    widget: {
      allowedValues: firstDisplayValue ? (list as displayType[]) : toList(list as string[]),
      defaultValue: defaultVal ? defaultVal : firstDisplayValue ? firstDisplayValue : (list as string[])[0],
    },
  };
};

const simpleSwitch = (widgetName: string): TemplateWidget<SwitchWidget> => ({
  widgetName,
  widgetType: 'Switch',
  widget: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
});

const markTypeWidget: TemplateWidget<ListWidget> = {
  widgetName: `markType`,
  widgetType: 'List',
  widget: {allowedValues: toList(MARK_TYPES), defaultValue: 'circle'},
};

const SHELF: Template = {
  templateName: 'Shelf',
  templateDescription: 'A tablea-style shelf builder',
  templateLanguage: 'vega-lite',
  templateAuthor: 'BUILT_IN',
  code: stringify(shelfProgram),
  widgets: [
    // x & y dimensions
    ...['X', 'Y'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList({
          widgetName: `${key}Type`,
          list: VegaLiteDataTypes.map(toQuote),
          defaultVal: toQuote('quantitative'),
        }),
        simpleList({widgetName: `${key}ScaleType`, list: [toQuote('linear'), toQuote('log')]}),
        simpleSwitch(`${key}IncludeZero`),
        simpleSwitch(`${key}bin`),
        simpleList({widgetName: `${key}AggFull`, list: spatialAggs, displayName: `${key}Agg`}),
        simpleList({widgetName: `${key}AggSimple`, list: justCountAgg, displayName: `${key}Agg`}),
      ]);
    }, []),

    markTypeWidget,

    // size & color dimensions
    ...['Size', 'Color'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList({widgetName: `${key}Type`, list: VegaLiteDataTypes.map(toQuote)}),
        simpleSwitch(`${key}bin`),
        simpleList({widgetName: `${key}AggFull`, list: spatialAggs, displayName: `${key}Agg`}),
        simpleList({widgetName: `${key}AggSimple`, list: justCountAgg, displayName: `${key}Agg`}),
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList({widgetName: `${key}Type`, list: VegaLiteDataTypes.map(toQuote)}),
      ]);
    }, []),
    // text
    makeDataTarget('Text'),
    simpleList({widgetName: 'TextType', list: VegaLiteDataTypes.map(toQuote)}),
    simpleList({widgetName: 'TextAggFull', list: spatialAggs, displayName: 'TextAgg'}),
    simpleList({widgetName: 'TextAggSimple', list: justCountAgg, displayName: 'TextAgg'}),

    // row / column
    ...['Row', 'Column'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key)]);
    }, []),
  ],
  widgetValidations: [
    ...['X', 'Y', 'Size', 'Color'].reduce((acc, key) => {
      return acc.concat([
        {
          queryResult: 'hide',
          queryTarget: `${key}AggFull`,
          query: {[key]: null},
        },
        {
          queryResult: 'hide',
          queryTarget: `${key}AggSimple`,
          query: {[key]: '*'},
        },
      ]);
    }, []),
  ],
};
export default SHELF;
