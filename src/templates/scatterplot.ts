import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {toList} from '../utils';
import {AUTHORS} from '../constants/index';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {
    type: 'point',
    tooltip: true,
    size: '[Radius]',
    color: {$cond: {true: '[Single Color]', false: null, query: '!parameters.Color'}},
  },
  encoding: {
    x: {field: '[xDim]', type: '[xType]', scale: {zero: '[Zeroes]'}},
    y: {field: '[yDim]', type: '[yType]', scale: {zero: '[Zeroes]'}},
    color: {
      $cond: {query: 'parameters.Color', true: {field: '[Color]', type: '[colorType]'}, false: null},
    },
  },
};

const SCATTERPLOT: Template = {
  widgets: [
    {name: 'xDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true}},
    {
      name: 'xType',
      type: 'List',
      config: {allowedValues: toList(['quantitative', 'ordinal'])},
      validations: [{queryResult: 'hide', query: '!parameters.xDim'}],
    },
    {
      name: 'yDim',
      type: 'DataTarget',
      config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      name: 'yType',
      type: 'List',
      config: {allowedValues: toList(['quantitative', 'ordinal'])},
      validations: [{queryResult: 'hide', query: '!parameters.yDim'}],
    },
    {name: 'Color', type: 'DataTarget', config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: false}},
    {
      name: 'colorType',
      type: 'List',
      config: {allowedValues: toList(['ordinal', 'quantitative'])},
      validations: [{queryResult: 'hide', query: '!parameters.Color'}],
    },
    {
      name: 'Single Color',
      type: 'List',
      config: {allowedValues: toList(['steelblue', 'blue', 'red'])},
      validations: [{queryResult: 'hide', query: 'parameters.Color'}],
    },

    {name: 'OtherSettingsSection', type: 'Section', config: null},
    {
      name: 'Zeroes',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: true},
    },
    {name: `Radius`, type: 'Slider', config: {minVal: 10, maxVal: 60, step: 1, defaultValue: 15}},
  ],
  templateAuthor: AUTHORS,
  templateName: 'Scatterplot',
  templateDescription:
    'A simple scatterplot that can map color and position, supports ordinal and quantitative data.',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
