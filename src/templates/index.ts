import {
  DataTargetWidget,
  DataType,
  FreeTextWidget,
  GenWidget,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  ShortcutsWidget,
  SliderWidget,
  SwitchWidget,
  Template,
  TextWidget,
  Widget,
} from '../types';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES, tableau10} from './vega-common';
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
import RADAR from './radar-chart';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
export type WidgetFactoryFunc = (idx: number) => GenWidget;
export const DataTargetFactory: WidgetFactoryFunc = idx =>
  ({
    name: `Var${idx}`,
    type: 'DataTarget',
    config: {allowedTypes: DATA_TYPES, required: true},
  } as Widget<DataTargetWidget>);
export const MultiDataTargetFactory: WidgetFactoryFunc = idx =>
  ({
    name: `MultiDim${idx}`,
    type: 'MultiDataTarget',
    config: {allowedTypes: DATA_TYPES, required: true, minNumberOfTargets: 0},
  } as Widget<MultiDataTargetWidget>);
export const ListFactory: WidgetFactoryFunc = idx =>
  ({
    name: `ListItem${idx}`,
    type: 'List',
    config: {allowedValues: [] as {display: string; value: string}[], defaultValue: null},
  } as Widget<ListWidget>);
export const SwitchFactory: WidgetFactoryFunc = idx =>
  ({
    name: `Switch${idx}`,
    type: 'Switch',
    config: {active: 'true', inactive: 'false', defaultsToActive: true},
  } as Widget<SwitchWidget>);
export const SliderFactory: WidgetFactoryFunc = idx =>
  ({
    name: `Slider${idx}`,
    type: 'Slider',
    config: {minVal: 0, maxVal: 10, step: 1, defaultValue: 5},
  } as Widget<SliderWidget>);
export const SectionFactory: WidgetFactoryFunc = idx =>
  ({name: `Section${idx}`, type: 'Section', config: null} as Widget<SectionWidget>);
export const ShortcutsFactory: WidgetFactoryFunc = idx =>
  ({name: `Shortcut${idx}`, type: 'Shortcut', config: {shortcuts: []}} as Widget<ShortcutsWidget>);
export const FreeTextFactory: WidgetFactoryFunc = idx =>
  ({name: `FreeText${idx}`, type: 'FreeText', config: {useParagraph: false}} as Widget<FreeTextWidget>);
export const TextFactory: WidgetFactoryFunc = idx =>
  ({name: `Text${idx}`, type: 'Text', config: {text: ''}} as Widget<TextWidget>);

export const widgetFactory: {[type: string]: WidgetFactoryFunc} = {
  DataTarget: DataTargetFactory,
  MultiDataTarget: MultiDataTargetFactory,
  List: ListFactory,
  Switch: SwitchFactory,
  Slider: SliderFactory,
  Section: SectionFactory,
  Shortcuts: ShortcutsFactory,
  FreeText: FreeTextFactory,
  Text: TextFactory,
};

export const widgetFactoryByGroups: {[type: string]: {[x: string]: WidgetFactoryFunc}} = {
  'Data Widgets': {
    DataTarget: DataTargetFactory,
    MultiDataTarget: MultiDataTargetFactory,
  },
  'Value Widgets': {
    List: ListFactory,
    Switch: SwitchFactory,
    Slider: SliderFactory,
    FreeText: FreeTextFactory,
  },
  'Mark up Widgets': {
    Section: SectionFactory,
    Text: TextFactory,
    Shortcuts: ShortcutsFactory,
  },
};

export const preconfiguredWidgets: {[type: string]: WidgetFactoryFunc} = {
  'Discrete Color Options': idx =>
    ({
      name: `ColorList${idx}`,
      type: 'List',
      config: {allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES)},
    } as Widget<ListWidget>),
  'Data Types Options': idx =>
    ({
      name: `DataTypeOptions${idx}`,
      type: 'List',
      config: {allowedValues: toList(['quantitative', 'temporal', 'ordinal', 'nominal'])},
    } as Widget<ListWidget>),
  'Single Color Options (Tableau 10)': idx =>
    ({
      name: `DataTypeOptions${idx}`,
      type: 'List',
      config: {allowedValues: toList(tableau10)},
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
  RADAR,
  // SIMPLE_SCATTER,
];
