import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  DataType,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SliderWidget,
  SwitchWidget,
  Template,
  TemplateWidget,
  TextWidget,
  GenWidget,
  ShortcutsWidget,
} from './types';
import {EMPTY_SPEC_BY_LANGUAGE} from '../reducers/default-state';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './example-templates/vega-common';
import ATOM from './example-templates/atom';
import BEESWARM_TEMPLATE from './example-templates/bee-swarm';
import DATATABLE from './example-templates/table';
import GALLERY from './example-templates/gallery';
import PIECHART_TEMPLATE from './example-templates/pie-chart';
import SCATTERPLOT_TEMPLATE from './example-templates/scatterplot';
import {getUserName} from '../utils/local-storage';
// import SIMPLE_SCATTER from './example-templates/simple-scatterplot';
import SHELF from './example-templates/polestar-template';
import UNITVIS from './example-templates/unit-vis';

export const BLANK_TEMPLATE: Template = {
  templateAuthor: getUserName(),
  templateLanguage: 'vega-lite',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: stringify(EMPTY_SPEC_BY_LANGUAGE['vega-lite']),
  widgets: [],
};

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
export type WidgetFactoryFunc = (idx: number) => GenWidget;
export const widgetFactory: {[type: string]: WidgetFactoryFunc} = {
  DataTarget: idx =>
    ({
      name: `Var${idx}`,
      type: 'DataTarget',
      config: {allowedTypes: DATA_TYPES, required: true},
    } as TemplateWidget<DataTargetWidget>),
  MultiDataTarget: idx =>
    ({
      name: `MultiDim${idx}`,
      type: 'MultiDataTarget',
      config: {allowedTypes: DATA_TYPES, required: true, minNumberOfTargets: 0},
    } as TemplateWidget<MultiDataTargetWidget>),
  List: idx =>
    ({
      name: `ListItem${idx}`,
      type: 'List',
      config: {allowedValues: [] as {display: string; value: string}[], defaultValue: null},
    } as TemplateWidget<ListWidget>),

  Switch: idx =>
    ({
      name: `Switch${idx}`,
      type: 'Switch',
      config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
    } as TemplateWidget<SwitchWidget>),
  Text: idx => ({name: `Text${idx}`, type: 'Text', config: {text: ''}} as TemplateWidget<TextWidget>),
  Slider: idx =>
    ({
      name: `Slider${idx}`,
      type: 'Slider',
      config: {minVal: 0, maxVal: 10, step: 1, defaultValue: 5},
    } as TemplateWidget<SliderWidget>),
  Section: idx =>
    ({
      name: `Section${idx}`,
      type: 'Section',
      config: null,
    } as TemplateWidget<SectionWidget>),
  Shortcuts: idx =>
    ({
      name: `Shortcut${idx}`,
      type: 'Shortcut',
      config: {shortcuts: []},
    } as TemplateWidget<ShortcutsWidget>),
  FreeText: idx =>
    ({
      name: `FreeText${idx}`,
      type: 'FreeText',
      config: {},
    } as TemplateWidget<ShortcutsWidget>),
};

export const preconfiguredWidgets: {[type: string]: WidgetFactoryFunc} = {
  'Discrete Color Options': idx =>
    ({
      name: `ColorList${idx}`,
      type: 'List',
      config: {allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES), defaultValue: null},
    } as TemplateWidget<ListWidget>),
  'Data Types Options': idx =>
    ({
      name: `DataTypeOptions${idx}`,
      type: 'List',
      config: {allowedValues: toList(['quantitative', 'temporal', 'ordinal', 'nominal']), defaultValue: null},
    } as TemplateWidget<ListWidget>),
};

export const DEFAULT_TEMPLATES: Template[] = [
  SHELF,
  ATOM,
  DATATABLE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
  UNITVIS,
  GALLERY,
  // SIMPLE_SCATTER,
];
