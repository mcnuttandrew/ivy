import {Template} from '../types';
const TABLE_EXAMPLE: any = {
  $schema: 'hydra-data-table',
  transforms: [],
  columns: '[columns]',
};

const DATATABLE: Template = {
  templateName: 'Data Table',
  templateLanguage: 'hydra-data-table',
  code: JSON.stringify(TABLE_EXAMPLE, null, 2),
  widgets: [
    {
      widgetName: 'columns',
      widgetType: 'MultiDataTarget',
      allowedTypes: ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'],
      required: true,
      minNumberOfTargets: 0,
      maxNumberOfTargets: 5,
    },
  ],
  widgetValidations: [],
};
export default DATATABLE;
