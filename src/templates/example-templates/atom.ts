import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  ListWidget,
  SwitchWidget,
  TextWidget,
  TemplateWidget,
  DataType,
  SectionWidget,
  WidgetValidationQuery,
  WidgetValidation,
  Template,
  WidgetSubType,
} from '../types';
import {toList} from '../../utils';
import {simpleList} from './polestar-template-utils';

function generateLevel(
  idx: number,
): {widgets: TemplateWidget<WidgetSubType>[]; widgetValidations: WidgetValidation[]; layout: any} {
  const widgets: TemplateWidget<WidgetSubType>[] = [
    {
      widgetName: `Key${idx}`,
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: false,
      },
    },
    simpleList({
      widgetName: `Key${idx}Type`,
      defaultVal: null,
      displayName: `Key${idx}Type`,
      list: ['flatten', 'groupby', 'bin', 'passthrough', 'gridxy'],
    }),
    simpleList({
      widgetName: `Key${idx}AspectRatio`,
      defaultVal: null,
      displayName: `Key${idx}AspectRatio`,
      list: ['square', 'parents', 'fillX', 'fillY', 'maxfill', 'custom'],
    }),
  ];
  const widgetValidations: any[] = [
    idx > 1 && {
      queryResult: 'hide',
      queryTarget: `Key${idx}`,
      query: `!parameters.Key${idx - 1}`,
    },
    {
      queryResult: 'hide',
      queryTarget: `Key${idx}Type`,
      query: `!parameters.Key${idx}`,
    },
    {
      queryResult: 'hide',
      queryTarget: `Key${idx}AspectRatio`,
      query: `!parameters.Key${idx}`,
    },
  ].filter(d => d);
  return {widgets, widgetValidations, layout: {}};
}

const configurations = [1, 2, 3, 4, 5, 6].map(generateLevel);

/* eslint-disable @typescript-eslint/camelcase */
const ATOM_TEMPLATE: any = {
  layouts: configurations.map(d => d.layout),
  mark: {
    color: {
      key: '[colorBy]',
      type: 'categorical',
      scheme: '',
    },
  },
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
};
/* eslint-enable @typescript-eslint/camelcase */

const ATOM: Template = {
  templateName: 'AtomExplore',
  templateDescription: 'A system for exploring unit visualizations',
  templateLanguage: 'unit-vis',
  templateAuthor: 'BUILT_IN',
  code: stringify(ATOM_TEMPLATE),
  widgets: [
    {
      widgetName: 'colorBy',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: true,
      },
    },
    simpleList({
      widgetName: 'colorScheme',
      defaultVal: 'schemeCategory10',
      displayName: 'colorScheme',
      list: [
        'schemeCategory10',
        'schemeAccent',
        'schemeDark2',
        'schemePaired',
        'schemePastel1',
        'schemePastel2',
        'schemeSet1',
        'schemeSet2',
        'schemeSet3',
        'schemeTableau10',
      ],
    }),
    ...configurations.reduce((acc, d) => acc.concat(d.widgets), []),
  ],
  widgetValidations: [...configurations.reduce((acc, d) => acc.concat(d.widgetValidations), [])],
};
export default ATOM;
