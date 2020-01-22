import {Template} from '../types';

const DATATABLE: Template = {
  templateName: 'Data Table',
  templateDescription: 'A good old fashioned data table',
  templateLanguage: 'hydra-data-table',
  templateAuthor: 'BUILT_IN',
  code: require('./table.hydra.js').default,
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
