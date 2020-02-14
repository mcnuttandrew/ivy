import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
const TABLE_EXAMPLE: any = {
  $schema: 'hydra-data-table',
  transforms: [],
  columns: '[columns]',
};

const DATATABLE: Template = {
  templateName: 'Data Table',
  templateDescription:
    'A good old fashioned data table, show any type of data in a tabular format. A great way to double check your data.',
  templateLanguage: 'hydra-data-table',
  templateAuthor: 'HYDRA-AUTHORS',
  code: stringify(TABLE_EXAMPLE),
  widgets: [
    {
      name: 'columns',
      type: 'MultiDataTarget',
      config: {
        allowedTypes: ['MEASURE', 'DIMENSION', 'TIME'],
        required: true,
        minNumberOfTargets: 0,
        maxNumberOfTargets: 5,
      },
    },
  ],
};
export default DATATABLE;
