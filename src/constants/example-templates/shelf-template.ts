import {Template} from '../templates';
import {toList} from '../../utils';
const withConditional = (trueCondition: any, conditional: any) => {
  return {
    condition: conditional,
    trueCondition: trueCondition,
    // falseCondition implicitly here
  };
};

const SHELF_TEMPLATE_CODE: any = {
  transform: [],
  spec: {
    encoding: {
      x: {
        field: '[X]',
        type: 'quantitative',
      },
      y: {
        field: '[Y]',
        type: 'quantitative',
      },
      size: {
        field: ['SIZE'],
        type: 'quantitative',
      },
      color: {
        field: ['COLOR'],
        type: 'quantitative',
      },
      shape: {
        field: ['SHAPE'],
        type: 'quantitative',
      },
      detail: {
        field: ['DETAIL'],
        type: 'quantitative',
      },
      text: withConditional(
        {
          field: ['TEXT'],
          type: ['TEXT_TYPE'],
        },
        {TEXT: '*'},
      ),
    },
    mark: {
      type: 'point',
      tooltip: true,
    },
  },
  repeat: {
    row: [''],
  },
};

const ALLDATA_TYPES = ['MEASURE', 'DIMENSION', 'METACOLUMN', 'TIME'];
const makeDimWithType = (dim: string) => {
  return [
    {
      widgetName: dim,
      widgetType: 'DataTarget',
      allowedTypes: ALLDATA_TYPES,
      required: true,
    },
    {
      widgetName: `${dim}DataType`,
      widgetType: 'List',
      allowedValues: toList(ALLDATA_TYPES),
      defaultValue: '"mean"',
    },
  ];
};
const SHELF: Template = {
  templateName: 'scatterplot',
  templateLanguage: 'vega-lite',
  code: JSON.stringify(SHELF_TEMPLATE_CODE, null, 2),
  widgets: [
    ...['X', 'Y', 'SIZE', 'COLOR', 'SHAPE', 'DETAIL'].reduce(
      (acc: any[], key: string) => acc.concat(makeDimWithType(key)),
      [],
    ),
  ],
  widgetValidations: [],
};
export default SHELF;
