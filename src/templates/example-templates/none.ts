import {Template} from '../types';

const FIRST_TEXT =
  'In order visualize your data, you need to pick a template to work in. To begin either select a template from the selection in main pane (to the right), or use this panel to search. Search can either happen through text:\n\n\n';
const SECOND_TEXT =
  '\n\n\n or by search for templates that match the data you are interested in visualizing, which you can do using this widget\n\n\n';
const NoneTemplate: Template = {
  templateName: '_____none_____',
  templateDescription: 'blank filler template',
  templateAuthor: 'BUILT_IN',
  templateLanguage: 'none',
  widgets: [
    {name: 'asddd', type: 'Section', config: null},
    {name: 'asd', type: 'Text', config: {text: FIRST_TEXT}},
    {name: 'SearchKey', displayName: 'Search for template', type: 'FreeText', config: {}},
    {name: 'asd', type: 'Text', config: {text: SECOND_TEXT}},
    {
      name: 'dataTargetSearch',
      displayName: 'Data target search',
      type: 'MultiDataTarget',
      config: {allowedTypes: ['MEASURE', 'DIMENSION', 'TIME'], required: true, minNumberOfTargets: 0},
    },
  ],
  code: JSON.stringify({
    $schema: 'none',
    dataTargetSearch: '[dataTargetSearch]',
    // SearchKey: '[SearchKey]',
  }),
};
export default NoneTemplate;
