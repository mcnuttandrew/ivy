import {Template} from '../types';
import {AUTHORS} from '../constants/index';
const TABLE_EXAMPLE: any = {
  $schema: 'hydra-data-table',
  columns: '[columns]',
};

const DATATABLE: Template = {
  templateName: 'Data Table',
  templateDescription:
    'A good old fashioned data table, show any type of data in a tabular format. A great way to double check your data.',
  templateLanguage: 'hydra-data-table',
  templateAuthor: AUTHORS,
  code: JSON.stringify(TABLE_EXAMPLE, null, 2),
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
