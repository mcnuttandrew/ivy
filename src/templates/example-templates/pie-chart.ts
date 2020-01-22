import {Template} from '../types';
import {VEGA_CATEGORICAL_COLOR_SCHEMES, AGGREGATES} from './vega-common';
import {toList} from '../../utils';

const PieChart: Template = {
  templateName: 'pie chart',
  templateDescription: 'A popular way to show part-to-whole relationships',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'vega',
  widgets: [
    {
      widgetName: 'category',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: true,
      },
    },
    {
      widgetName: 'value',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['MEASURE'],
        required: true,
      },
    },
    {
      widgetName: 'aggregate',
      widgetType: 'List',
      widget: {
        allowedValues: toList(AGGREGATES),
        defaultValue: 'mean',
      },
    },
    {
      widgetName: 'colorScheme',
      widgetType: 'List',
      widget: {
        allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
        defaultValue: 'category20',
      },
    },
    {
      widgetName: 'DonutChart',
      widgetType: 'Switch',
      widget: {
        activeValue: 60,
        inactiveValue: 0,
        defaultsToActive: true,
      },
    },
    {
      widgetName: 'Sort',
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: true,
      },
    },
  ],
  widgetValidations: [],
  code: require('./pie-chart.hydra.js').default,
};
export default PieChart;
