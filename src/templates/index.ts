import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  MultiDataTargetWidget,
  ListWidget,
  SwitchWidget,
  TextWidget,
  SliderWidget,
  TemplateWidget,
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
import UNITVIS from './example-templates/unit-vis';

export const BLANK_TEMPLATE: Template = {
  templateLanguage: 'vega-lite',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: stringify(EMPTY_SPEC),
  widgets: [],
  widgetValidations: [],
};

// META COLUMNS NOT CURRENTLY ALLOWED IN TEMPLATES
const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
// const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];
export const widgetFactory = {
  DataTarget: (idx: number) =>
    ({
      widgetName: `Dim${idx}`,
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: DATA_TYPES,
        required: true,
      },
    } as TemplateWidget<DataTargetWidget>),
  MultiDataTarget: (idx: number) =>
    ({
      widgetName: `MultiDim${idx}`,
      widgetType: 'MultiDataTarget',
      widget: {
        allowedTypes: DATA_TYPES,
        required: true,
        minNumberOfTargets: 0,
      },
    } as TemplateWidget<MultiDataTargetWidget>),
  List: (idx: number) =>
    ({
      widgetName: `ListItem${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: [] as {display: string; value: string}[],
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),

  Switch: (idx: number) =>
    ({
      widgetName: `Switch${idx}`,
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: true,
      },
    } as TemplateWidget<SwitchWidget>),
  Text: (idx: number) =>
    ({
      widgetName: `Text${idx}`,
      widgetType: 'Text',
      widget: {
        text: '',
      },
    } as TemplateWidget<TextWidget>),
  Slider: (idx: number) =>
    ({
      widgetName: `Slider${idx}`,
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 10,
        step: 1,
        defaultValue: 5,
      },
    } as TemplateWidget<SliderWidget>),
};

export const preconfiguredWidgets = {
  'Discrete Color Options': (idx: number) =>
    ({
      widgetName: `ColorList${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),
  'Data Types Options': (idx: number) =>
    ({
      widgetName: `DataTypeOptions${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: toList([
          'quantitative',
          'temporal',
          'ordinal',
          'nominal',
        ]),
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),
};

export const DEFAULT_TEMPLATES: Template[] = [
  DATATABLE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
  UNITVIS,
];
