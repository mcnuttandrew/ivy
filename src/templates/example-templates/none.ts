import {Template} from '../types';

const NoneTemplate: Template = {
  templateName: '_____none_____',
  templateDescription: 'blank filler template',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'none',
  widgets: [
    {
      widgetName: 'asddd',
      widgetType: 'Section',
      widget: {
        text: 'Select a template to begin',
      },
    },
    {
      widgetName: 'SearchKey',
      displayName: 'Search for template',
      widgetType: 'FreeText',
      widget: {},
    },
    {
      widgetName: 'asd',
      widgetType: 'Text',
      widget: {
        text: 'Select a template to begin, or add columns below to search for templates',
      },
    },
    {
      widgetName: 'Data target search',
      widgetType: 'MultiDataTarget',
      widget: {
        allowedTypes: ['MEASURE', 'DIMENSION', 'TIME'],
        required: true,
        minNumberOfTargets: 0,
      },
    },
  ],
  widgetValidations: [],
  code: JSON.stringify({$schema: 'none'}),
};
export default NoneTemplate;
