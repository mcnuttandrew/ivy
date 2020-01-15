import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {type: 'point', tooltip: true, color: '[Color]'},
  encoding: {
    x: {field: '[xDim]', type: '[xType]', scale: {zero: '[Zeroes]'}},
    y: {field: '[yDim]', type: '[yType]', scale: {zero: '[Zeroes]'}},
    // color: {field: '[ColorDim', type: 'colorType', }
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
      widgetName: `SliderX`,
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 10,
        step: 1,
        defaultValue: 5,
      },
    },
    {
      widgetName: 'Color',
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
  ],
  templateName: 'Scatterplot',
  templateDescription: 'A full ish scatterplot',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
