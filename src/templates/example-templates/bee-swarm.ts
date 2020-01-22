import {Template} from '../types';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './vega-common';
import {toList} from '../../utils';

const BeeSwarm: Template = {
  templateName: 'BeeSwarm chart',
  templateDescription: 'A unit approach to showing the sizes of groups',
  templateLanguage: 'vega',
  templateAuthor: 'BUILT_IN',
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
      widgetName: 'radius',
      widgetType: 'Slider',
      widget: {
        minVal: 2,
        maxVal: 15,
        step: 1,
        defaultValue: 5,
      },
    },
    {
      widgetName: 'collide',
      widgetType: 'Slider',
      widget: {
        minVal: 1,
        maxVal: 10,
        step: 1,
        defaultValue: 1,
      },
    },
    {
      widgetName: 'gravityX',
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 1,
        step: 0.01,
        defaultValue: 0.2,
      },
    },
    {
      widgetName: 'gravityY',
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 1,
        step: 0.01,
        defaultValue: 0.1,
      },
    },
    {
      widgetName: 'static',
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: false,
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
  ],
  widgetValidations: [],
  code: require('./bee-swarm.hydra.js').default,
};
export default BeeSwarm;
