import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {
    type: 'point',
    tooltip: true,
    size: '[Radius]',
    color: {CONDITIONAL: {true: '[Single Color]', false: null, query: {Color: null}}},
  },
  encoding: {
    x: {field: '[xDim]', type: '[xType]', scale: {zero: '[Zeroes]'}},
    y: {field: '[yDim]', type: '[yType]', scale: {zero: '[Zeroes]'}},
    // color: {field: '[Color]', type: {CONDITIONAL: {true: '[colorType]', false: null, query: {Color: null}}}},
    color: {CONDITIONAL: {query: {Color: '*'}, true: {field: '[Color]', type: '[colorType]'}, false: null}},
  },
};

const SCATTERPLOT: Template = {
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['MEASURE', 'DIMENSION'],
        required: true,
      },
    },
    {
      widgetName: 'xType',
      widgetType: 'List',
      widget: {
        allowedValues: [
          {display: '"quantitative"', value: '"quantitative"'},
          {display: '"ordinal"', value: '"ordinal"'},
        ],
        defaultValue: '"quantitative"',
      },
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['MEASURE', 'DIMENSION'],
        required: true,
      },
    },
    {
      widgetName: 'yType',
      widgetType: 'List',
      widget: {
        allowedValues: [
          {display: '"quantitative"', value: '"quantitative"'},
          {display: '"ordinal"', value: '"ordinal"'},
        ],
        defaultValue: '"quantitative"',
      },
    },
    {
      widgetName: 'Color',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['MEASURE', 'DIMENSION'],
        required: false,
      },
    },
    {
      widgetName: 'colorType',
      widgetType: 'List',
      widget: {
        allowedValues: [
          {display: '"quantitative"', value: '"quantitative"'},
          {display: '"ordinal"', value: '"ordinal"'},
        ],
        defaultValue: '"ordinal"',
      },
    },
    {
      widgetName: 'Single Color',
      widgetType: 'List',
      widget: {
        allowedValues: [
          {display: '"steelblue"', value: '"steelblue"'},
          {display: '"blue"', value: '"blue"'},
          {display: '"red"', value: '"red"'},
        ],
        defaultValue: '"steelblue"',
      },
    },
    {
      widgetName: 'Zeroes',
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: true,
      },
    },
    {
      widgetName: 'Text6',
      widgetType: 'Text',
      widget: {
        text: 'This is a test message',
      },
    },
    {
      widgetName: `Radius`,
      widgetType: 'Slider',
      widget: {
        minVal: 10,
        maxVal: 60,
        step: 1,
        defaultValue: 15,
      },
    },
  ],
  widgetValidations: [
    {
      queryResult: 'hide',
      queryTarget: 'xType',
      query: {xDim: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'yType',
      query: {yDim: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'colorType',
      query: {Color: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'Single Color',
      query: {Color: '*'},
    },
  ],
  templateName: 'Scatterplot',
  templateDescription: 'A full ish scatterplot',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
