/**
 * Type necessary to define the validator pull over here
 * in order to prevent stack overflow on the schema builder
 */
export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'CUSTOM';

export type WidgetType =
  | 'DataTarget'
  | 'MultiDataTarget'
  | 'List'
  | 'Switch'
  | 'Text'
  | 'Slider'
  | 'Section'
  | 'Shortcut'
  | 'FreeText';
export interface Widget<T> {
  /**
   *   The name of widget to be used, this name will be swapped into the code string, must be unqiue
   */
  name: string;
  /**
   * The name to be shown in the GUI, does not have to be unique.
   */
  displayName?: string;
  /**
   * The type of the widget to be used, this defined the specific gui item that the user interacts with
   */
  type: WidgetType;
  config: T;
  /**
   * Sometimes you want to decative certain values depending on the state of the UI
   * This advanced features allows you to do that
   */
  conditions?: Condition[];
}
export interface DataTargetWidget {
  allowedTypes: DataType[];
  required: boolean;
}
export interface MultiDataTargetWidget {
  allowedTypes: DataType[];
  minNumberOfTargets?: number;
  maxNumberOfTargets?: number;
  required: boolean;
}
export interface ListWidget {
  allowedValues: ({display: string; value: string} | string)[];
  defaultValue?: string;
}
export interface SwitchWidget {
  active: string;
  inactive: string;
  defaultsToActive: boolean;
}
export interface TextWidget {
  text: string;
}
export type SectionWidget = null;
export interface SliderWidget {
  minVal: number;
  maxVal: number;
  step?: number;
  defaultValue: number;
}

export interface Shortcut {
  label: string;
  shortcutFunction: string;
}
export interface ShortcutsWidget {
  shortcuts: Shortcut[];
}
export type FreeTextWidget = {
  useParagraph: boolean;
};
export type WidgetSubType =
  | DataTargetWidget
  | MultiDataTargetWidget
  | ListWidget
  | SwitchWidget
  | TextWidget
  | SliderWidget
  | SectionWidget
  | ShortcutsWidget
  | FreeTextWidget;

/**
 * The main configuration object for templates
 */
export interface Template {
  /**
   * The language of the code, determines how the code will be interpreted.
   * Ivy currently supports vega, vega-lite, and it's own data table system
   *
   *  __Default value:__ `vega-lite`
   */
  templateLanguage: string;

  /**
   * The name of the template. Template names must be unique, so this can over-ride other extant templates
   */
  templateName: string;

  /**
   * The description that users will see in the chart chooser gallery
   */
  templateDescription?: string;

  /**
   * The creator of the template
   */
  templateAuthor: string;

  /**
   * The code to be interpreted by the renderer
   */
  code: string;

  /**
   * The mechanism by which users interact with your template
   */
  widgets: Widget<WidgetSubType>[];

  /**
   * Advanced tool for providing special extra cards
   */
  customCards?: CustomCard[];

  /**
   * Whether or not to allow view materialization / fan out
   */
  disallowFanOut?: boolean;
}

/**
 * Convience container type for the general template widget case
 */
export type GenWidget = Widget<WidgetSubType>;

export type CustomCard = {name: string; description: string};
/**
 * A widget Condition query, executed raw javascript. Parameter values (the value of the current ui)
 * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
 * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
 */
export type ConditionQuery = string;

/**
 * What to do in response to the result of the query, should be either 'hide' or 'show'
 */
export type QueryResult = 'show' | 'hide';
export interface Condition {
  /**
   * What to do in response to the result of the query, should be either 'hide' or 'show'
   */
  queryResult: QueryResult;

  /**
   * A widget Condition query, executed raw javascript. Parameter values (the value of the current ui)
   * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
   * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
   */
  query: string;
}
