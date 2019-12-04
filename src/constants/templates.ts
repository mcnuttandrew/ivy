import {DataType} from '../types';
export type WidgetType = 'DataTarget' | 'List' | 'Switch' | 'Text';
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

export interface Template {
  templateName: string;
  templateDescription?: string;
  code: string;
  widgets: (
    | TemplateWidget
    | DataTargetWidget
    | ListWidget
    | SwitchWidget
    | TextWidget)[];
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

const OVERVIEW_TEMPLATE: Template = {
  templateName: 'overview',
  templateDescription:
    'see an automatically generated overview of your template collection',
  code: JSON.stringify({}),
  widgets: [
    {
      widgetName: 'Explanation',
      widgetType: 'Text',
      text: 'using this view you will blah blah blah',
    },
  ],
};

export const DEFAULT_TEMPLATES: Template[] = [
  OVERVIEW_TEMPLATE,
  SCATTERPLOT_TEMPLATE,
];
