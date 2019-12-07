import {Template} from './templates';
const SCATTERPLOT_EXAMPLE: any = {
  mark: {
    type: 'point',
    tooltip: true,
  },
  encoding: {
    x: {
      field: '[xDim]',
      type: 'quantitative',
    },
    y: {
      field: '[yDim]',
      type: 'quantitative',
    },
  },
};

export const SCATTERPLOT_TEMPLATE: Template = {
  templateName: 'scatterplot',
  templateLanguage: 'vega-lite',
  code: JSON.stringify(SCATTERPLOT_EXAMPLE, null, 2),
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE'],
      required: true,
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE'],
      required: true,
    },
  ],
  widgetValidations: [],
};

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

const VEGA_CATEGORICAL_COLOR_SCHEMES = [
  'accent',
  'category10',
  'category20',
  'category20b',
  'category20c',
  'dark2',
  'paired',
  'pastel1',
  'pastel2',
  'set1',
  'set2',
  'set3',
  'tableau10',
  'tableau20',
];
const AGGREGATES = [
  'count',
  'missing',
  'distinct',
  'sum',
  'mean',
  'median',
  'min',
  'max',
];
const toList = (list: string[]) =>
  list.map(display => ({
    display,
    value: `"${display}"`,
  }));

export const PIECHART_TEMPLATE: Template = {
  templateName: 'pie chart',
  templateLanguage: 'vega',
  widgets: [
    {
      widgetName: 'category',
      widgetType: 'DataTarget',
      allowedTypes: ['DIMENSION'],
      required: true,
    },
    {
      widgetName: 'value',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE'],
      required: true,
    },
    {
      widgetName: 'aggregate',
      widgetType: 'List',
      allowedValues: toList(AGGREGATES),
      defaultValue: '"mean"',
    },
    {
      widgetName: 'colorScheme',
      widgetType: 'List',
      allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
      defaultValue: '"category20"',
    },
    {
      widgetName: 'DonutChart',
      widgetType: 'Switch',
      activeValue: '60',
      inactiveValue: '0',
      defaultsToActive: true,
    },
    {
      widgetName: 'Sort',
      widgetType: 'Switch',
      activeValue: 'true',
      inactiveValue: 'false',
      defaultsToActive: true,
    },
  ],
  widgetValidations: [],
  code: JSON.stringify(PIECHART_EXAMPLE, null, 2),
};

// TODO I'm not very happy with this special view stratagey?
// const OVERVIEW_TEMPLATE: Template = {
//   templateName: 'overview',
//   templateLanguage: 'vega-lite',
//   templateDescription:
//     'see an automatically generated overview of your template collection',
//   code: JSON.stringify({}),
//   widgets: [
//     {
//       widgetName: 'Explanation',
//       widgetType: 'Text',
//       text: 'using this view you will blah blah blah',
//     },
//   ],
//   widgetValidations: [],
// };
