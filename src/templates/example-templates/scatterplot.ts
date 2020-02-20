import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
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
const BASIC_TYPES = [
  {display: '"quantitative"', value: '"quantitative"'},
  {display: '"ordinal"', value: '"ordinal"'},
];

const SCATTERPLOT: Template = {
  widgets: [
    {name: 'xDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true}},
    {
      name: 'xType',
      type: 'List',
      config: {allowedValues: BASIC_TYPES, defaultValue: '"quantitative"'},
      validations: [{queryResult: 'hide', query: '!parameters.xType'}],
    },
    {
      name: 'yDim',
      type: 'DataTarget',
      config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      name: 'yType',
      type: 'List',
      config: {allowedValues: BASIC_TYPES, defaultValue: '"quantitative"'},
      validations: [{queryResult: 'hide', query: '!parameters.yDim'}],
    },
    {name: 'Color', type: 'DataTarget', config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: false}},
    {
      name: 'colorType',
      type: 'List',
      config: {allowedValues: BASIC_TYPES, defaultValue: '"ordinal"'},
      validations: [{queryResult: 'hide', query: '!parameters.Color'}],
    },
    {
      name: 'Single Color',
      type: 'List',
      config: {
        allowedValues: ['"steelblue"', '"blue"', '"red"'].map(x => ({display: x, value: x})),
        defaultValue: '"steelblue"',
      },
      validations: [{queryResult: 'hide', query: 'parameters.Color'}],
    },

    {name: 'OtherSettingsSection', type: 'Section', config: null},
    {
      name: 'Zeroes',
      type: 'Switch',
      config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
    },
    {name: `Radius`, type: 'Slider', config: {minVal: 10, maxVal: 60, step: 1, defaultValue: 15}},
  ],
  templateAuthor: 'HYDRA-AUTHORS',
  templateName: 'Scatterplot',
  templateDescription:
    'A simple scatterplot that can map color and position, supports ordinal and quantitative data.',
  templateLanguage: 'vega-lite',
  code: stringify(SCATTERPLOT_EXAMPLE),
};
export default SCATTERPLOT;
