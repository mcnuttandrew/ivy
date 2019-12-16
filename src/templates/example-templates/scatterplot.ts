import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {type: 'point', tooltip: true},
  encoding: {
    x: {field: '[xDim]', type: '[xType]', scale: {zero: '[Zeroes]'}},
    y: {field: '[yDim]', type: '[yType]', scale: {zero: '[Zeroes]'}},
  },
};

const SCATTERPLOT: Template = {
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE', 'DIMENSION'],
      required: true,
    },
    {
      widgetName: 'xType',
      widgetType: 'List',
      allowedValues: [
        {display: '"quantitative"', value: '"quantitative"'},
        {display: '"ordinal"', value: '"ordinal"'},
      ],
      defaultValue: '"quantitative"',
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE', 'DIMENSION'],
      required: true,
    },
    {
      widgetName: 'yType',
      widgetType: 'List',
      allowedValues: [
        {display: '"quantitative"', value: '"quantitative"'},
        {display: '"ordinal"', value: '"ordinal"'},
      ],
      defaultValue: '"quantitative"',
    },
    {
      widgetName: 'Zeroes',
      widgetType: 'Switch',
      activeValue: 'true',
      inactiveValue: 'false',
      defaultsToActive: true,
    },
    {
      widgetName: 'Text6',
      widgetType: 'Text',
      text: 'This is a test message',
    },
  ],
  widgetValidations: [],
  templateName: 'Scatterplot',
  templateDescription: 'A full ish scatterplot',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
