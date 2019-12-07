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
  $schema: 'https://vega.github.io/schema/vega/v4.json',
  width: 200,
  height: 200,
  autosize: 'fit',

  data: [
    {
      name: 'table',
      values: 'myData',
      transform: [
        {
          type: 'formula',
          expr: "datum.[category] + ': ' + datum.[value]",
          as: 'tooltip',
        },
        {
          type: 'pie',
          field: '[category]',
          startAngle: 0,
          endAngle: 6.29,
          sort: true,
        },
      ],
    },
  ],

  scales: [
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: '[value]'},
      range: {scheme: 'category20c'},
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
          innerRadius: {value: 60},
          outerRadius: {signal: 'width / 2'},
          cornerRadius: {value: 0},
          tooltip: {field: 'tooltip'},
        },
      },
    },
  ],
};

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
      widgetName: 'sortValues',
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
