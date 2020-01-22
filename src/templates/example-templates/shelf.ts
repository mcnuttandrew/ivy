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

const justCountAgg = toList(['none', 'count']);
justCountAgg[0].value = undefined;
const spatialAggs = [...justCountAgg, ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode'])];

const makeDataTarget = (dim: string): TemplateWidget<DataTargetWidget> => ({
  widgetName: dim,
  widgetType: 'DataTarget',
  widget: {allowedTypes: ALLDATA_TYPES, required: false},
});

type displayType = {display: any; value: any};
const simpleList = (
  widgetName: string,
  list: string[] | displayType[],
  defaultVal?: string,
): TemplateWidget<ListWidget> => {
  const firstDisplayValue = (list[0] as displayType).display;
  return {
    widgetName,
    widgetType: 'List',
    widget: {
      allowedValues: firstDisplayValue ? (list as displayType[]) : toList(list as string[]),
      defaultValue: defaultVal ? defaultVal : firstDisplayValue ? firstDisplayValue : (list as string[])[0],
    },
  };
};

const simpleSwitch = (widgetName: string): TemplateWidget<SwitchWidget> => ({
  widgetName,
  widgetType: 'Switch',
  widget: {activeValue: true, inactiveValue: false, defaultsToActive: true},
});

const markTypeWidget: TemplateWidget<ListWidget> = {
  widgetName: `markType`,
  widgetType: 'List',
  widget: {allowedValues: toList(MARK_TYPES), defaultValue: 'circle'},
};

const SHELF: Template = {
  templateName: 'Shelf',
  templateLanguage: 'vega-lite',
  templateAuthor: 'BUILT_IN',
  code: require('./shelf.hydra').default,
  widgets: [
    // x & y dimensions
    ...['X', 'Y'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList(`${key}Type`, VegaLiteDataTypes, 'quantitative'),
        simpleList(`${key}ScaleType`, ['linear', 'log']),
        simpleSwitch(`${key}IncludeZero`),
        simpleSwitch(`${key}bin`),
        simpleList(`${key}Agg`, spatialAggs),
        // BLOCKER: need to add a "display name" to all of the widgets
      ]);
    }, []),

    markTypeWidget,

    // size & color dimensions
    ...['Size', 'Color'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        simpleList(`${key}Type`, VegaLiteDataTypes),
        simpleSwitch(`${key}bin`),
        simpleList(`${key}Agg`, spatialAggs),
        // BLOCKER: need to add a "display name" to all of the widgets
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key), simpleList(`${key}Type`, VegaLiteDataTypes)]);
    }, []),
    // text
    makeDataTarget('Text'),
    simpleList('TextType', VegaLiteDataTypes),
    simpleList('TextAgg', spatialAggs),
    // BLOCKER: need to add a "display name" to all of the widgets

    // row / column
    ...['Row', 'Column'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key)]);
    }, []),
  ],
  widgetValidations: [],
};
export default SHELF;
