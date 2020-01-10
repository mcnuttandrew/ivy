export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'METACOLUMN';

export type WidgetType =
  | 'DataTarget'
  | 'MultiDataTarget'
  | 'List'
  | 'Switch'
  | 'Text'
  | 'Slider';
export interface TemplateWidget<T> {
  /**
   *   The name of widget to be used, this name will be swapped into the code string
   */
  widgetName: string;
  /**
   * The type of the widget to be used, this defined the specific gui item that the user interacts with
   */
  widgetType: WidgetType;
  widget: T;
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
  allowedValues: {display: string; value: string}[];
  defaultValue: string;
}
export interface SwitchWidget {
  activeValue: string;
  inactiveValue: string;
  defaultsToActive: boolean;
}
export interface TextWidget {
  text: string;
}
export interface SliderWidget {
  minVal: number;
  maxVal: number;
  step?: number;
  defaultValue: number;
}
export type WidgetSubType =
  | DataTargetWidget
  | MultiDataTargetWidget
  | ListWidget
  | SwitchWidget
  | TextWidget
  | SliderWidget;

/**
 * The main configuration object for templates
 */
export interface Template {
  /**
   * The language of the code, determines how the code will be interpreted.
   * Hydra currently supports vega, vega-lite, and it's own data table system
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
   * The code to be interpreted by the renderer
   */
  code: string;

  /**
   * The mechanism by which users interact with your template
   */
  widgets: TemplateWidget<WidgetSubType>[];

  /**
   * Sometimes you want to decative certain values depending on the state of the UI
   * This advanced features allows you to do that
   */
  widgetValidations: WidgetValidation[];
  // TODO MAYBE ADD A PREVIEW PIC?
}

export interface WidgetValidation {
  /**
   * What to do in response to the result of the query
   */
  queryResult: 'show' | 'hide';

  /**
   * The name of the variable being targeted
   */
  queryTarget: string;

  /**
   * the query object. Multiple key in an object is interpreted as an AND
   * * -> any val, used for setting things
   * null -> no val, used for checking empty
   * string -> equal to specific value, if this then that
   * string[] -> one of vals
   */
  query: {[key: string]: '*' | null | string | string[]};
  // TODO this doesn't actually handle data type checks,
  // e.g. do this if field is measure, do that if it's dimension
}

export interface TemplateMap {
  [key: string]: string | string[];
}
