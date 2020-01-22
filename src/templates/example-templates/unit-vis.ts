import {Template} from '../types';

const UNITVIS: Template = {
  templateName: 'UnitVis Test',
  templateDescription: 'a test for the unit vis language',
  templateLanguage: 'unit-vis',
  templateAuthor: 'BUILT_IN',
  code: require('./unit-vis.hydra.js').default,
  widgets: [
    {
      widgetName: 'Key1',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: true,
      },
    },
    {
      widgetName: 'Key2',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['MEASURE'],
        required: true,
      },
    },
    {
      widgetName: 'category',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: true,
      },
    },
  ],
  widgetValidations: [],
};
export default UNITVIS;
