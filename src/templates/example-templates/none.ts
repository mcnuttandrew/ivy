import {Template} from '../types';

const NoneTemplate: Template = {
  templateName: '_____none_____',
  templateDescription: 'blank filler template',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'none',
  widgets: [
    {widgetName: 'asddd', widgetType: 'Section', widget: null},
    {
      widgetName: 'asd',
      widgetType: 'Text',
      widget: {
        text:
          'In order visualize your data, you need to pick a template to work in. To begin either select a template from the selection in main pane (to the right), or use this panel to search. Search can either happen through text:\n\n\n',
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
        text:
          '\n\n\n or by search for templates that match the data you are interested in visualizing, which you can do using this widget\n\n\n',
      },
    },
    {
      widgetName: 'dataTargetSearch',
      displayName: 'Data target search',
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
