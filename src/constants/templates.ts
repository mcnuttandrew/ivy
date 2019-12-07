import {DataType} from '../types';
import {SCATTERPLOT_TEMPLATE, PIECHART_TEMPLATE} from './example-templates';
export type WidgetType = 'DataTarget' | 'List' | 'Switch' | 'Text' | 'Slider';
export interface TemplateWidget {
  widgetName: string;
  widgetType: WidgetType;
}
export interface DataTargetWidget extends TemplateWidget {
  widgetType: 'DataTarget';
  allowedTypes: DataType[];
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
// TODO slider widget

export interface Template {
  templateLanguage: string;
  templateName: string;
  templateDescription?: string;
  code: string;
  widgets: (
    | TemplateWidget
    | DataTargetWidget
    | ListWidget
    | SwitchWidget
    | TextWidget)[];
  widgetValidations: widgetValidation[];
  // TODO MAYBE ADD A PREVIEW PIC?
}

export interface widgetValidation {
  queryResult: 'show' | 'hide';
  // * -> any val, used for setting things
  // null -> no val, used for checking empty
  // string -> equal to specific value, if this then that
  // string[] -> one of vals
  query: {[key: string]: '*' | null | string | string[]};
  // TODO this doesn't actually handle data type checks,
  // e.g. do this if field is measure, do that if it's dimension
}

export interface TemplateMap {
  [key: string]: string;
}

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];
export const widgetFactory = {
  List: (idx: number) => {
    const allowedValues: {display: string; value: string}[] = [];
    const newWidget: ListWidget = {
      widgetName: `ListItem${idx}`,
      widgetType: 'List',
      allowedValues,
      defaultValue: null,
    };
    return newWidget;
  },
  DataTarget: (idx: number) => {
    const newWidget: DataTargetWidget = {
      widgetName: `Dim${idx}`,
      widgetType: 'DataTarget',
      allowedTypes: DATA_TYPES,
      required: true,
    };
    return newWidget;
  },
  Switch: (idx: number) => {
    const newWidget: SwitchWidget = {
      widgetName: `Switch${idx}`,
      widgetType: 'Switch',
      activeValue: 'true',
      inactiveValue: 'false',
      defaultsToActive: true,
    };
    return newWidget;
  },
  Text: (idx: number) => {
    const newWidget: TextWidget = {
      widgetName: `Text${idx}`,
      widgetType: 'Text',
      text: '',
    };
    return newWidget;
  },
};

export const DEFAULT_TEMPLATES: Template[] = [
  // OVERVIEW_TEMPLATE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
];
