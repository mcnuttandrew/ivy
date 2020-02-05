import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
/* eslint-disable @typescript-eslint/camelcase */
const UNIT_VIS_EXAMPLE: any = {
  layouts: [
    {
      subgroup: {
        type: 'groupby',
        key: '[Key1]',
      },
      aspect_ratio: 'fillX',
    },
    {
      subgroup: {
        type: 'bin',
        key: '[Key2]',
        numBin: 10,
      },
      aspect_ratio: 'fillY',
    },
    {
      subgroup: {
        type: 'flatten',
      },
      aspect_ratio: 'maxfill',
    },
  ],
  mark: {
    color: {
      key: '[category]',
      type: 'categorical',
    },
  },
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
};
/* eslint-enable @typescript-eslint/camelcase */

const UNITVIS: Template = {
  templateName: 'UnitVis Test',
  templateDescription:
    'A simple unit vis chart with a rudimentary preconfiguration, it makes use of the unit vis language.',
  templateLanguage: 'unit-vis',
  templateAuthor: 'BUILT_IN',
  code: stringify(UNIT_VIS_EXAMPLE),
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
