import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const TABLE_EXAMPLE: any = {
  $schema: 'hydra-data-table',
  transforms: [],
  columns: '[columns]',
};

const DATATABLE: Template = {
  templateName: 'Data Table',
  templateDescription: 'A good old fashioned data table',
  templateLanguage: 'hydra-data-table',
  code: stringify(TABLE_EXAMPLE),
  widgets: [
    {
      widgetName: 'columns',
      widgetType: 'MultiDataTarget',
      widget: {
        allowedTypes: ['MEASURE', 'DIMENSION', 'TIME'],
        required: true,
        minNumberOfTargets: 0,
        maxNumberOfTargets: 5,
      },
    },
  ],
  widgetValidations: [],
};
export default DATATABLE;
