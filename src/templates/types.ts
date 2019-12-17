export type DataType = 'MEASURE' | 'DIMENSION' | 'TIME' | 'METACOLUMN';

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
