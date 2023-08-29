import stringify from '../utils/stringify';
import {Template} from '../types';
import {AUTHORS} from '../constants/index';
const UNIT_VIS_EXAMPLE: any = {
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
  mark: {color: {key: '[category]', type: 'categorical'}},
  layouts: [
    {subgroup: {type: 'groupby', key: '[Key1]'}, aspect_ratio: 'fillX'},
    {subgroup: {type: 'bin', key: '[Key2]', numBin: 10}, aspect_ratio: 'fillY'},
    {subgroup: {type: 'flatten'}, aspect_ratio: 'maxfill'},
  ],
};

const UNITVIS: Template = {
  templateName: 'UnitVis Test',
  templateDescription:
    'A simple unit vis chart with a rudimentary preconfiguration, it makes use of the unit vis language.',
  templateLanguage: 'unit-vis',
  templateAuthor: AUTHORS,
  code: stringify(UNIT_VIS_EXAMPLE),
  widgets: [
    {name: 'Key1', type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: true}},
    {name: 'Key2', type: 'DataTarget', config: {allowedTypes: ['MEASURE'], required: true}},
    {name: 'category', type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: true}},
  ],
};
export default UNITVIS;
