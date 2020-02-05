import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {
    type: 'point',
    tooltip: true,
    size: '[Radius]',
    color: {CONDITIONAL: {true: '[Single Color]', false: null, query: '!parameters.Color'}},
  },
  encoding: {
    x: {field: '[xDim]', type: '[xType]', scale: {zero: '[Zeroes]'}},
    y: {field: '[yDim]', type: '[yType]', scale: {zero: '[Zeroes]'}},
    color: {
      CONDITIONAL: {query: 'parameters.Color', true: {field: '[Color]', type: '[colorType]'}, false: null},
    },
  },
};
const BASIC_TYPES = [
  {display: '"quantitative"', value: '"quantitative"'},
  {display: '"ordinal"', value: '"ordinal"'},
];

const SCATTERPLOT: Template = {
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      widgetName: 'xType',
      widgetType: 'List',
      widget: {allowedValues: BASIC_TYPES, defaultValue: '"quantitative"'},
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      widgetName: 'yType',
      widgetType: 'List',
      widget: {allowedValues: BASIC_TYPES, defaultValue: '"quantitative"'},
    },
    {
      widgetName: 'Color',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: false},
    },
    {
      widgetName: 'colorType',
      widgetType: 'List',
      widget: {allowedValues: BASIC_TYPES, defaultValue: '"ordinal"'},
    },
    {
      widgetName: 'Single Color',
      widgetType: 'List',
      widget: {
        allowedValues: ['"steelblue"', '"blue"', '"red"'].map(x => ({display: x, value: x})),
        defaultValue: '"steelblue"',
      },
    },

    {widgetName: 'OtherSettingsSection', widgetType: 'Section', widget: null},
    {
      widgetName: 'Zeroes',
      widgetType: 'Switch',
      widget: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
    },
    {widgetName: 'Text6', widgetType: 'Text', widget: {text: 'This is a test message'}},
    {
      widgetName: `Radius`,
      widgetType: 'Slider',
      widget: {minVal: 10, maxVal: 60, step: 1, defaultValue: 15},
    },
  ],
  widgetValidations: [
    {queryResult: 'hide', queryTarget: 'xType', query: '!parameters.xType'},
    {queryResult: 'hide', queryTarget: 'yType', query: '!parameters.yDim'},
    {queryResult: 'hide', queryTarget: 'colorType', query: '!parameters.Color'},
    {queryResult: 'hide', queryTarget: 'Single Color', query: 'parameters.Color'},
  ],
  templateName: 'Scatterplot',
  templateDescription:
    'A simple scatterplot that can map color and position, supports ordinal and quantitative data.',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
