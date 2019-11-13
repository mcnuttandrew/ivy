// probably need to have a notion of typing for some of the widgets
export type WidgetType = 'DataTarget' | 'List' | 'Switch';
export interface TemplateWidget {
  widgetName: string;
  widgetType: WidgetType;
  defaultValue?: any;
  required: boolean;
}
export interface Template {
  templateName: string;
  code: string;
  widgets: TemplateWidget[];
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
      defaultValue: null,
      required: true,
    },
    {
      widgetName: 'yDim',
      widgetType: 'DataTarget',
      defaultValue: null,
      required: true,
    },
  ],
};

export const DEFAULT_TEMPLATES: Template[] = [SCATTERPLOT_TEMPLATE];
