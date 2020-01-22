import {Template} from '../types';
import {toList} from '../../utils';

const ordinOrQuant = [
  {display: 'quantitative', value: 'quantitative'},
  {display: 'ordinal', value: 'ordinal'},
];
const SCATTERPLOT: Template = {
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      widgetName: 'xType',
      widgetType: 'List',
      widget: {allowedValues: ordinOrQuant, defaultValue: 'quantitative'},
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: true},
    },
    {
      widgetName: 'yType',
      widgetType: 'List',
      widget: {allowedValues: ordinOrQuant, defaultValue: 'quantitative'},
    },
    {
      widgetName: 'Color',
      widgetType: 'DataTarget',
      widget: {allowedTypes: ['MEASURE', 'DIMENSION'], required: false},
    },
    {
      widgetName: 'colorType',
      widgetType: 'List',
      widget: {allowedValues: ordinOrQuant, defaultValue: 'ordinal'},
    },
    {
      widgetName: 'Single Color',
      widgetType: 'List',
      widget: {allowedValues: toList(['steelblue', 'blue', 'red']), defaultValue: 'steelblue'},
    },
    {
      widgetName: 'Zeroes',
      widgetType: 'Switch',
      widget: {activeValue: true, inactiveValue: false, defaultsToActive: true},
    },
    {
      widgetName: 'Text6',
      widgetType: 'Text',
      widget: {text: 'This is a test message'},
    },
    {
      widgetName: `Radius`,
      widgetType: 'Slider',
      widget: {minVal: 10, maxVal: 60, step: 1, defaultValue: 15},
    },
  ],
  widgetValidations: [
    {
      queryResult: 'hide',
      queryTarget: 'xType',
      query: {xDim: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'yType',
      query: {yDim: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'colorType',
      query: {Color: null},
    },
    {
      queryResult: 'hide',
      queryTarget: 'Single Color',
      query: {Color: '*'},
    },
  ],
  templateName: 'Scatterplot',
  templateDescription: 'A full ish scatterplot',
  templateLanguage: 'vega-lite',
  code: require('./scatterplot.hydra.js').default,
};
export default SCATTERPLOT;
