import {Template} from '../types';

const NoneTemplate: Template = {
  templateName: '_____none_____',
  templateDescription: 'blank filler template',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'none',
  widgets: [
    {
      widgetName: 'asd',
      widgetType: 'Text',
      widget: {
        text: 'Select a template to begin',
      },
    },
  ],
  widgetValidations: [],
  code: require('./none.hydra.js'),
};
export default NoneTemplate;
