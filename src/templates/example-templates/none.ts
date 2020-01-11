import {Template} from '../types';

const NoneTemplate: Template = {
  templateName: '_____none_____',
  templateDescription: 'blank filler template',
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
  code: JSON.stringify({$schema: 'none'}),
};
export default NoneTemplate;
