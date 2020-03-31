import {Template} from '../types';
import {SECTIONS} from '../components/gallery';
import {AUTHORS} from '../constants/index';
import {getGallerySectionPref} from '../utils/local-storage';

const toList = (arr: string[]): {display: string; value: string}[] =>
  arr.map(display => ({display, value: `"${display}"`}));
const FIRST_TEXT =
  'In order visualize your data, you need to pick a template to work in. To begin either select a template from the selection in main pane (to the right), or use this panel to search. Search can either happen through text:\n\n\n';
const SECOND_TEXT =
  '\n\n\n or by search for templates that match the data you are interested in visualizing, which you can do using this widget\n\n\n';
const THIRD_TEXT = '\n\n\n You can organize the gallery using various section organizations: \n\n\n';

const persistedDefault = getGallerySectionPref();
const Gallery: Template = {
  templateName: '____gallery____',
  templateDescription: 'The home gallery of the application.',
  templateAuthor: AUTHORS,
  templateLanguage: 'galleryLang',
  disallowFanOut: true,
  widgets: [
    {name: 'asddd', type: 'Section', config: null},
    {name: 'asd', type: 'Text', config: {text: FIRST_TEXT}},
    {name: 'SearchKey', displayName: 'Search for template', type: 'FreeText', config: {useParagraph: false}},
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
      name: 'sectionStratagey',
      displayName: 'Organize by',
      type: 'List',
      config: {
        allowedValues: toList(SECTIONS),
        defaultValue:
          persistedDefault && !persistedDefault.includes('undefined') ? persistedDefault : `"none"`,
      },
    },
  ],
  code: JSON.stringify({
    $schema: 'galleryLang',
    dataTargetSearch: '[dataTargetSearch]',
    SearchKey: '[SearchKey]',
    sectionStratagey: '[sectionStratagey]',
    minRequiredTargets: '[minRequiredTargets]',
    maxRequiredTargets: '[maxRequiredTargets]',
  }),
};
export default Gallery;
