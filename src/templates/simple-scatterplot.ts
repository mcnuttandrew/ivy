import * as stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {AUTHORS} from '../constants/index';

const SCATTERPLOT: Template = {
  widgets: [
    {name: 'xDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: true}},
    {name: 'yDim', type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: true}},
    {name: 'Color', type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: false}},
    {
      name: 'colorType',
      type: 'List',
      config: {
        allowedValues: ['"quantitative"', '"ordinal"'].map((x) => ({display: x, value: x})),
        defaultValue: '"ordinal"',
      },
      conditions: [{query: '!parameters.Color', queryResult: 'hide'}],
    },
    {
      name: 'Single Color',
      type: 'List',
      config: {
        allowedValues: ['"steelblue"', '"blue"', '"red"'].map((x) => ({display: x, value: x})),
        defaultValue: '"steelblue"',
      },
      conditions: [{query: 'parameters.Color', queryResult: 'hide'}],
    },
  ],
  templateName: 'Simple Scatterplot',
  templateDescription: 'A simple scatterplot that can map color and position.',
  templateAuthor: AUTHORS,
  templateLanguage: 'vega-lite',
  code: stringify({
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    mark: {type: 'point', color: {$if: '!parameters.Color', $then: '[Single Color]', $else: null}},
    encoding: {
      x: {field: '[xDim]', type: 'quantitative'},
      y: {field: '[yDim]', type: 'quantitative'},
      color: {$if: 'parameters.Color', $then: {field: '[Color]', type: '[colorType]'}, $else: null},
    },
  }),
};
export default SCATTERPLOT;
