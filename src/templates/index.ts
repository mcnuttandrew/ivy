import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  MultiDataTargetWidget,
  ListWidget,
  SwitchWidget,
  TextWidget,
  SliderWidget,
  Template,
} from './types';
import {EMPTY_SPEC} from '../reducers/default-state';
import {DataType} from '../types';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './example-templates/vega-common';
import DATATABLE from './example-templates/table';
import SCATTERPLOT_TEMPLATE from './example-templates/scatterplot';
import PIECHART_TEMPLATE from './example-templates/pie-chart';
import BEESWARM_TEMPLATE from './example-templates/bee-swarm';

export const BLANK_TEMPLATE: Template = {
  templateLanguage: 'vega-lite',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: stringify(EMPTY_SPEC),
  widgets: [],
  widgetValidations: [],
};

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
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
];
