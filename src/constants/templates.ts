import {DataType} from '../types';
// probably need to have a notion of typing for some of the widgets
export type WidgetType = 'DataTarget' | 'List' | 'Switch' | 'Text';
export interface TemplateWidget {
  widgetName: string;
  widgetType: WidgetType;
  required: boolean;
}
export interface DataTargetWidget extends TemplateWidget {
  widgetType: 'DataTarget';
  allowedTypes: DataType[];
}
export interface ListWidget extends TemplateWidget {
  widgetType: 'List';
  allowedValues: string[];
  defaultValue: string;
}
export interface SwitchWidget extends TemplateWidget {
  widgetType: 'Switch';
  defaultValue: boolean;
}
export interface TextWidget extends TemplateWidget {
  widgetType: 'Text';
  text: string;
}

export interface Template {
  templateName: string;
  code: string;
  widgets: (
    | TemplateWidget
    | DataTargetWidget
    | ListWidget
    | SwitchWidget
    | TextWidget
  )[];
  // TODO MAYBE ADD A PREVIEW PIC?
}

export interface TemplateMap {
  [key: string]: string;
}

const SCATTERPLOT_EXAMPLE: any = {
  mark: {
    type: 'point',
    tooltip: true,
  },
  encoding: {
    x: {
      field: '[xDim]',
      type: 'quantitative',
    },
    y: {
      field: '[yDim]',
      type: 'quantitative',
    },
  },
};

const SCATTERPLOT_TEMPLATE: Template = {
  templateName: 'scatterplot',
  code: JSON.stringify(SCATTERPLOT_EXAMPLE, null, 2),
  widgets: [
    {
      widgetName: 'xDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE'],
      required: true,
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      allowedTypes: ['MEASURE'],
      required: true,
    },
  ],
};

export const DEFAULT_TEMPLATES: Template[] = [SCATTERPLOT_TEMPLATE];
