import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {VEGA_CATEGORICAL_COLOR_SCHEMES, AGGREGATES} from './vega-common';
import {toList} from '../../utils';
// https://observablehq.com/@simon-lang/simple-vega-pie-chart
const PIECHART_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 200,
  height: 200,
  padding: 50,
  autosize: 'fit',

  data: [
    {
      name: 'table',
      values: 'myData',
      transform: [
        {
          type: 'aggregate',
          groupby: ['[category]'],
          fields: ['[value]'],
          ops: ['[aggregate]'],
          as: ['pieAg'],
        },

        {
          type: 'pie',
          field: 'pieAg',
          startAngle: 0,
          endAngle: 6.29,
          sort: '[Sort]',
        },
        {
          type: 'formula',
          expr: "datum.[category] + ': ' + datum.pieAg",
          as: 'tooltip',
        },
      ],
    },
  ],

  scales: [
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: '[category]'},
      range: {scheme: '[colorScheme]'},
    },
    {
      name: 'r',
      type: 'sqrt',
      domain: [0, 1],
      zero: false,
      range: [90, 100],
    },
  ],

  marks: [
    {
      type: 'arc',
      from: {data: 'table'},
      encode: {
        enter: {
          fill: {scale: 'color', field: '[category]'},
          x: {signal: 'width / 2'},
          y: {signal: 'height / 2'},
          startAngle: {field: 'startAngle'},
          endAngle: {field: 'endAngle'},
          innerRadius: {value: '[DonutChart]'},
          outerRadius: {signal: 'width / 2'},
          cornerRadius: {value: 0},
          tooltip: {field: 'tooltip'},
        },
      },
    },
    {
      type: 'text',
      from: {data: 'table'},
      encode: {
        enter: {
          x: {field: {group: 'width'}, mult: 0.5},
          y: {field: {group: 'height'}, mult: 0.5},
          radius: {scale: 'r', value: 1.3},
          theta: {signal: '(datum.startAngle + datum.endAngle)/2'},
          fill: {value: '#000'},
          align: {value: 'center'},
          baseline: {value: 'middle'},
          text: {field: '[category]'},
        },
      },
    },
  ],
};

const PieChart: Template = {
  templateName: 'pie chart',
  templateDescription:
    'A popular way to show part-to-whole relationships, can express as donut chart or a pie chart.',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'vega',
  widgets: [
    {
      widgetName: 'category',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['DIMENSION'], required: true},
    },
    {
      widgetName: 'Sort',
      widgetType: 'Switch',
      widget: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
    },
    {
      widgetName: 'value',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE'], required: true},
    },
    {
      widgetName: 'aggregate',
      widgetType: 'List',
      widget: {allowedValues: toList(AGGREGATES), defaultValue: '"mean"'},
    },
    {widgetName: 'OtherSettingsSection', widgetType: 'Section', widget: null},
    {
      widgetName: 'colorScheme',
      widgetType: 'List',
      widget: {allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES), defaultValue: '"category20"'},
    },
    {
      widgetName: 'DonutChart',
      widgetType: 'Switch',
      widget: {activeValue: '60', inactiveValue: '0', defaultsToActive: true},
    },
  ],
  widgetValidations: [],
  code: stringify(PIECHART_EXAMPLE),
};
export default PieChart;
