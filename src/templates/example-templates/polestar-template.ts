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
  SectionWidget,
  WidgetValidationQuery,
  WidgetValidation,
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
const VegaLiteDataTypes = ['nominal', 'ordinal', 'quantitative', 'temporal']; //.map(toQuote);
// TODO bin is handled incorrectly

const justCountAgg = toList(['none', 'count'].map(toQuote));
justCountAgg[0].value = undefined;
const spatialAggs = [
  ...justCountAgg,
  ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode'].map(toQuote)),
];
const used = (x: string): WidgetValidationQuery => ({[x]: '*'});
const unused = (x: string): WidgetValidationQuery => ({[x]: null});
const renderObjectIf = (object: any, checkKey: string, fieldName: string): any => ({
  [fieldName]: {CONDITIONAL: {query: used(checkKey), true: object, deleteKeyOnFalse: true}},
});

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
    ...renderObjectIf({field: '[Size]', type: '[SizeType]'}, 'Size', 'size'),
    ...renderObjectIf({field: '[Color]', type: '[ColorType]'}, 'Color', 'color'),
    ...renderObjectIf({field: '[Shape]', type: '[ShapeType]'}, 'Shape', 'shape'),
    ...renderObjectIf({field: '[Text]', type: '[TextType]'}, 'Text', 'text'),
    ...renderObjectIf({field: '[Detail]', type: '[DetailType]'}, 'Detail', 'detail'),
    ...['Row', 'Column'].reduce((acc, key) => {
      const newObj = renderObjectIf({field: `[${key}]`, type: 'nominal'}, key, key.toLowerCase());
      return {...acc, ...newObj};
    }, {}),
  },
  mark: {type: '[markType]', tooltip: true},
};

const makeDataTarget = (dim: string): TemplateWidget<DataTargetWidget> => ({
  widgetName: dim,
  widgetType: 'DataTarget',
  widget: {allowedTypes: ALLDATA_TYPES, required: false},
});

const makeText = (textLabel: string): TemplateWidget<TextWidget> => ({
  widgetName: textLabel,
  widgetType: 'Text',
  widget: {text: textLabel},
});
const makeSection = (sectionLabel: string): TemplateWidget<SectionWidget> => ({
  widgetName: sectionLabel,
  widgetType: 'Section',
  widget: {text: sectionLabel},
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

interface SimpleSwitchType {
  widgetName: string;
  displayName?: string;
}
const simpleSwitch = ({widgetName, displayName}: SimpleSwitchType): TemplateWidget<SwitchWidget> => ({
  widgetName,
  widgetType: 'Switch',
  displayName: displayName || null,
  widget: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
});

function addValidation(acc: WidgetValidation[], key: string) {
  return function adder(queryTarget: string): void {
    acc.push({queryTarget, queryResult: 'hide', query: unused(key)});
  };
}

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
        simpleList({
          widgetName: `${key}Type`,
          list: VegaLiteDataTypes,
          defaultVal: toQuote('quantitative'),
          displayName: 'Data type',
        }),
        simpleList({
          widgetName: `${key}ScaleType`,
          list: ['linear', 'log'],
          displayName: 'Scale type',
          defaultVal: toQuote('linear'),
        }),
        simpleSwitch({widgetName: `${key}IncludeZero`, displayName: 'Include Zero'}),
        simpleSwitch({widgetName: `${key}bin`, displayName: 'Bin'}),
        simpleList({widgetName: `${key}AggFull`, list: spatialAggs, displayName: `Aggregate`}),
        simpleList({widgetName: `${key}AggSimple`, list: justCountAgg, displayName: `Aggregate`}),
      ]);
    }, []),

    // Mark type
    makeSection('MarkDivider'),
    simpleList({widgetName: 'markType', list: toList(MARK_TYPES), defaultVal: toQuote('circle')}),

    // size & color dimensions
    ...['Color', 'Size'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList({widgetName: `${key}Type`, list: VegaLiteDataTypes, defaultVal: toQuote('ordinal')}),
        simpleSwitch({widgetName: `${key}bin`}),
        simpleList({widgetName: `${key}AggFull`, list: spatialAggs, displayName: 'Aggregate'}),
        simpleList({widgetName: `${key}AggSimple`, list: justCountAgg, displayName: 'Aggregate'}),
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList({widgetName: `${key}Type`, list: VegaLiteDataTypes, defaultVal: toQuote('nominal')}),
      ]);
    }, []),
    // text
    makeDataTarget('Text'),
    simpleList({widgetName: 'TextType', list: VegaLiteDataTypes, defaultVal: toQuote('nominal')}),
    simpleList({widgetName: 'TextAggFull', list: spatialAggs, displayName: 'TextAgg'}),
    simpleList({widgetName: 'TextAggSimple', list: justCountAgg, displayName: 'TextAgg'}),

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
