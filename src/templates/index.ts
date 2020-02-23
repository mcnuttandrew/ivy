import {
  DataTargetWidget,
  DataType,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SliderWidget,
  SwitchWidget,
  Template,
  Widget,
  TextWidget,
  GenWidget,
  ShortcutsWidget,
} from '../types';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './vega-common';
import ATOM from './atom';
import BEESWARM_TEMPLATE from './bee-swarm';
import DATATABLE from './table';
import PIECHART_TEMPLATE from './pie-chart';
import GALLERY from './gallery';
import SCATTERPLOT_TEMPLATE from './scatterplot';
// import SIMPLE_SCATTER from './simple-scatterplot';
import SHELF from './polestar-template';
import UNITVIS from './atom-example';
import PARALLEL_COORDINATES from './parallel-coordinates';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
export type WidgetFactoryFunc = (idx: number) => GenWidget;
export const widgetFactory: {[type: string]: WidgetFactoryFunc} = {
  DataTarget: idx =>
    ({
      name: `Var${idx}`,
      type: 'DataTarget',
      config: {allowedTypes: DATA_TYPES, required: true},
    } as Widget<DataTargetWidget>),
  MultiDataTarget: idx =>
    ({
      name: `MultiDim${idx}`,
      type: 'MultiDataTarget',
      config: {allowedTypes: DATA_TYPES, required: true, minNumberOfTargets: 0},
    } as Widget<MultiDataTargetWidget>),
  List: idx =>
    ({
      name: `ListItem${idx}`,
      type: 'List',
      config: {allowedValues: [] as {display: string; value: string}[], defaultValue: null},
    } as Widget<ListWidget>),

  Switch: idx =>
    ({
      name: `Switch${idx}`,
      type: 'Switch',
      config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
    } as Widget<SwitchWidget>),
  Text: idx => ({name: `Text${idx}`, type: 'Text', config: {text: ''}} as Widget<TextWidget>),
  Slider: idx =>
    ({
      name: `Slider${idx}`,
      type: 'Slider',
      config: {minVal: 0, maxVal: 10, step: 1, defaultValue: 5},
    } as Widget<SliderWidget>),
  Section: idx =>
    ({
      name: `Section${idx}`,
      type: 'Section',
      config: null,
    } as Widget<SectionWidget>),
  Shortcuts: idx =>
    ({
      name: `Shortcut${idx}`,
      type: 'Shortcut',
      config: {shortcuts: []},
    } as Widget<ShortcutsWidget>),
  FreeText: idx =>
    ({
      name: `FreeText${idx}`,
      type: 'FreeText',
      config: {},
    } as Widget<ShortcutsWidget>),
};

export const preconfiguredWidgets: {[type: string]: WidgetFactoryFunc} = {
  'Discrete Color Options': idx =>
    ({
      name: `ColorList${idx}`,
      type: 'List',
      config: {allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES), defaultValue: null},
    } as Widget<ListWidget>),
  'Data Types Options': idx =>
    ({
      name: `DataTypeOptions${idx}`,
      type: 'List',
      config: {allowedValues: toList(['quantitative', 'temporal', 'ordinal', 'nominal']), defaultValue: null},
    } as Widget<ListWidget>),
};

export const DEFAULT_TEMPLATES: Template[] = [
  SHELF,
  ATOM,
  DATATABLE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
  GALLERY,
  UNITVIS,
  PARALLEL_COORDINATES,
  // SIMPLE_SCATTER,
];
