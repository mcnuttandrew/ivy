import {DataType} from '../types';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './example-templates/vega-common';
import DATATABLE from './example-templates/table';
import SCATTERPLOT_TEMPLATE from './example-templates/scatterplot';
import PIECHART_TEMPLATE from './example-templates/pie-chart';
import BEESWARM_TEMPLATE from './example-templates/bee-swarm';

export type WidgetType =
  | 'DataTarget'
  | 'MultiDataTarget'
  | 'List'
  | 'Switch'
  | 'Text'
  | 'Slider';
export interface TemplateWidget {
  widgetName: string;
  widgetType: WidgetType;
}
export interface DataTargetWidget extends TemplateWidget {
  widgetType: 'DataTarget';
  allowedTypes: DataType[];
  required: boolean;
}
export interface MultiDataTargetWidget extends TemplateWidget {
  widgetType: 'MultiDataTarget';
  allowedTypes: DataType[];
  minNumberOfTargets?: number;
  maxNumberOfTargets?: number;
  required: boolean;
}
export interface ListWidget extends TemplateWidget {
  widgetType: 'List';
  allowedValues: {display: string; value: string}[];
  defaultValue: string;
}
export interface SwitchWidget extends TemplateWidget {
  widgetType: 'Switch';
  activeValue: string;
  inactiveValue: string;
  defaultsToActive: boolean;
}
export interface TextWidget extends TemplateWidget {
  widgetType: 'Text';
  text: string;
}
export interface SliderWidget extends TemplateWidget {
  widgetType: 'Slider';
  minVal: number;
  maxVal: number;
  step?: number;
  defaultValue: number;
}

export interface Template {
  templateLanguage: string;
  templateName: string;
  templateDescription?: string;
  code: string;
  widgets: (
    | TemplateWidget
    | DataTargetWidget
    | MultiDataTargetWidget
    | ListWidget
    | SwitchWidget
    | TextWidget
    | SliderWidget)[];
  widgetValidations: widgetValidation[];
  // TODO MAYBE ADD A PREVIEW PIC?
}

export interface widgetValidation {
  queryResult: 'show' | 'hide';
  queryTarget: string;
  // * -> any val, used for setting things
  // null -> no val, used for checking empty
  // string -> equal to specific value, if this then that
  // string[] -> one of vals
  query: {[key: string]: '*' | null | string | string[]};
  // TODO this doesn't actually handle data type checks,
  // e.g. do this if field is measure, do that if it's dimension
}

export interface TemplateMap {
  [key: string]: string | string[];
}

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];
export const widgetFactory = {
  DataTarget: (idx: number) =>
    ({
      widgetName: `Dim${idx}`,
      widgetType: 'DataTarget',
      allowedTypes: DATA_TYPES,
      required: true,
    } as DataTargetWidget),
  MultiDataTarget: (idx: number) =>
    ({
      widgetName: `MultiDim${idx}`,
      widgetType: 'MultiDataTarget',
      allowedTypes: DATA_TYPES,
      required: true,
      minNumberOfTargets: 0,
    } as MultiDataTargetWidget),
  List: (idx: number) =>
    ({
      widgetName: `ListItem${idx}`,
      widgetType: 'List',
      allowedValues: [] as {display: string; value: string}[],
      defaultValue: null,
    } as ListWidget),

  Switch: (idx: number) =>
    ({
      widgetName: `Switch${idx}`,
      widgetType: 'Switch',
      activeValue: 'true',
      inactiveValue: 'false',
      defaultsToActive: true,
    } as SwitchWidget),
  Text: (idx: number) =>
    ({
      widgetName: `Text${idx}`,
      widgetType: 'Text',
      text: '',
    } as TextWidget),
  Slider: (idx: number) =>
    ({
      widgetName: `Slider${idx}`,
      widgetType: 'Slider',
      minVal: 0,
      maxVal: 10,
      step: 1,
      defaultValue: 5,
    } as SliderWidget),
};

export const preconfiguredWidgets = {
  'Discrete Color Options': (idx: number) =>
    ({
      widgetName: `ColorList${idx}`,
      widgetType: 'List',
      allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
      defaultValue: null,
    } as ListWidget),
  'Data Types Options': (idx: number) =>
    ({
      widgetName: `DataTypeOptions${idx}`,
      widgetType: 'List',
      allowedValues: toList(['quantitative', 'temporal', 'ordinal', 'nominal']),
      defaultValue: null,
    } as ListWidget),
};

export const DEFAULT_TEMPLATES: Template[] = [
  DATATABLE,
  // OVERVIEW_TEMPLATE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
];

// TODO I'm not very happy with this special view stratagey?
// const OVERVIEW_TEMPLATE: Template = {
//   templateName: 'overview',
//   templateLanguage: 'vega-lite',
//   templateDescription:
//     'see an automatically generated overview of your template collection',
//   code: JSON.stringify({}),
//   widgets: [
//     {
//       widgetName: 'Explanation',
//       widgetType: 'Text',
//       text: 'using this view you will blah blah blah',
//     },
//   ],
//   widgetValidations: [],
// };
