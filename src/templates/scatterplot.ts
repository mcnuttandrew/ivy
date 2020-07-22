import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {toList} from './polestar-template-utils';
import {AUTHORS} from '../constants/index';
const SCATTERPLOT_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  layer: [
    {
      $cond: {
        query: 'parameters.showBand.includes("true")',
        true: {
          mark: {type: 'errorband', extent: 'stdev', opacity: 0.2},
          encoding: {y: {field: '[yDim]', type: 'quantitative'}},
        },
      },
    },
    {
      $cond: {
        query: 'parameters.showBand.includes("true")',
        true: {
          mark: 'rule',
          encoding: {y: {field: '[yDim]', type: 'quantitative', aggregate: 'mean'}},
        },
      },
    },

    {
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
          condition: {
            test: 'datum.[xDim] === null || datum.[yDim] === null',
            value: '#aaa',
          },
          field: {$cond: {query: 'parameters.Color', true: '[Color]'}},
          type: {$cond: {query: 'parameters.Color', true: '[colorType]'}},
        },
      },
    },
  ],
  config: {
    $cond: {
      query: 'parameters.showNulls.includes("true")',
      true: {
        mark: {invalid: null},
      },
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
      conditions: [{queryResult: 'hide', query: '!parameters.xDim'}],
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
      conditions: [{queryResult: 'hide', query: '!parameters.yDim'}],
    },
    {name: 'Color', type: 'DataTarget', config: {allowedTypes: ['MEASURE', 'DIMENSION'], required: false}},
    {
      name: 'colorType',
      type: 'List',
      config: {allowedValues: toList(['ordinal', 'quantitative'])},
      conditions: [{queryResult: 'hide', query: '!parameters.Color'}],
    },
    {
      name: 'Single Color',
      type: 'List',
      config: {allowedValues: toList(['steelblue', 'blue', 'red'])},
      conditions: [{queryResult: 'hide', query: 'parameters.Color'}],
    },

    {name: 'OtherSettingsSection', type: 'Section', config: null},
    {
      name: 'Zeroes',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: true},
    },
    {
      name: 'showNulls',
      displayName: 'Show Nulls Along Axes',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: true},
    },
    {
      name: 'showBand',
      displayName: 'Show Average Band',
      type: 'Switch',
      config: {active: 'true', inactive: 'false', defaultsToActive: false},
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
