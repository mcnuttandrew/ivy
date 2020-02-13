import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';

const SCATTERPLOT: Template = {
  widgets: [
    {name: 'xDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: true}},
    {name: 'yDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: true}},
    {name: 'Color', type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: false}},
    {
      name: 'colorType',
      type: 'List',
      config: {
        allowedValues: ['"quantitative"', '"ordinal"'].map(x => ({display: x, value: x})),
        defaultValue: '"ordinal"',
      },
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
  ],
  templateName: 'Simple Scatterplot',
  templateDescription: 'A simple scatterplot that can map color and position.',
  templateLanguage: 'vega-lite',
  code: stringify({
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    mark: {
      type: 'point',
      color: {CONDITIONAL: {query: '!parameters.Color', true: '[Single Color]', false: null}},
    },
    encoding: {
      x: {field: '[xDim]', type: 'quantitative'},
      y: {field: '[yDim]', type: 'quantitative'},
      color: {
        CONDITIONAL: {query: 'parameters.Color', true: {field: '[Color]', type: '[colorType]'}, false: null},
      },
    },
  }),
};
export default SCATTERPLOT;
