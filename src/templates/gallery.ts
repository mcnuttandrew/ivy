import {Template} from '../types';
import {SORTS} from '../components/gallery';
import {AUTHORS} from '../constants/index';

const FIRST_TEXT =
  'In order visualize your data, you need to pick a template to work in. To begin either select a template from the selection in main pane (to the right), or use this panel to search. Search can either happen through text:\n\n\n';
const SECOND_TEXT =
  '\n\n\n or by search for templates that match the data you are interested in visualizing, which you can do using this widget\n\n\n';
const THIRD_TEXT = '\n\n\n You can also facilitate browsing by sorting: \n\n\n';
const Gallery: Template = {
  templateName: '____gallery____',
  templateDescription: 'The home gallery of the application.',
  templateAuthor: AUTHORS,
  templateLanguage: 'galleryLang',
  disallowFanOut: true,
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
    {name: 'asddd', type: 'Section', config: null},
    {name: 'asd', type: 'Text', config: {text: THIRD_TEXT}},
    {
      name: 'Sort',
      type: 'List',
      config: {
        allowedValues: SORTS.map(display => ({display, value: `"${display}"`})),
        defaultValue: `"complexity"`,
      },
    },
    {
      name: 'Reverse Sort',
      type: 'Switch',
      config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
      validations: [{query: '!parameters.Sort === "null"', queryResult: 'hide'}],
    },
    {
      name: 'minRequiredTargets',
      type: 'Slider',
      config: {minVal: 0, maxVal: 20, step: 1, defaultValue: 0},
      validations: [{query: 'false', queryResult: 'show'}],
    },
    {
      name: 'maxRequiredTargets',
      type: 'Slider',
      config: {minVal: 0, maxVal: 20, step: 1, defaultValue: 0},
      validations: [{query: 'false', queryResult: 'show'}],
    },
    {type: 'Text', name: 'shortcuts label', config: {text: 'Search Shortcuts'}},
    {
      name: `Shortcuts`,
      type: 'Shortcut',
      config: {
        shortcuts: [
          {
            label: 'Unvariates',
            shortcutFunction: '{...parameters, minRequiredTargets: 1, maxRequiredTargets: 1}',
          },
          {
            label: 'Exploration',
            shortcutFunction: '{...parameters, minRequiredTargets: 6, maxRequiredTargets: 0}',
          },
          {
            label: 'Reset',
            shortcutFunction: '{...parameters, minRequiredTargets: 0, maxRequiredTargets: 0}',
          },
        ],
      },
    },
  ],
  code: JSON.stringify({
    $schema: 'galleryLang',
    dataTargetSearch: '[dataTargetSearch]',
    SearchKey: '[SearchKey]',
    Sort: '[Sort]',
    'Reverse Sort': '[Reverse Sort]',
    minRequiredTargets: '[minRequiredTargets]',
    maxRequiredTargets: '[maxRequiredTargets]',
  }),
};
export default Gallery;
