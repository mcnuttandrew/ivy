import stringify from 'json-stringify-pretty-compact';
import {TemplateWidget, WidgetValidation, Template, WidgetSubType, SliderWidget} from '../types';
import {simpleList} from './polestar-template-utils';

const TYPES = ['groupby', 'bin', 'passthrough', 'gridxy', 'flatten'];
const ASPECT_RATIOS = ['square', 'parents', 'fillX', 'fillY', 'maxfill', 'custom'];
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
      defaultVal: '"groupby"',
      displayName: `Key${idx}Type`,
      list: [...TYPES.map(d => ({display: d, value: `"${d}"`})), {display: 'null', value: 'null'}],
    }),
    simpleList({
      widgetName: `Key${idx}AspectRatio`,
      defaultVal: idx % 2 ? '"fillX"' : '"fillY"',
      displayName: `Key${idx}AspectRatio`,
      list: [...ASPECT_RATIOS.map(d => ({display: d, value: `"${d}"`})), {display: 'null', value: 'null'}],
    }),
    {
      widgetName: `Key${idx}numBins`,
      displayName: 'NumBins',
      widgetType: 'Slider',
      widget: {
        minVal: 1,
        maxVal: 15,
        step: 1,
        defaultValue: 10,
      },
    } as TemplateWidget<SliderWidget>,
  ];
  const NEVER_HIDE = idx === 1;
  const widgetValidations: any[] = [
    !NEVER_HIDE && {
      queryResult: 'hide',
      queryTarget: `Key${idx}`,
      query: `!parameters.Key${idx - 1}`,
    },
    !NEVER_HIDE && {
      queryResult: 'hide',
      queryTarget: `Key${idx}Type`,
      query: `!parameters.Key${idx - 1}`,
    },
    !NEVER_HIDE && {
      queryResult: 'hide',
      queryTarget: `Key${idx}AspectRatio`,
      query: `!parameters.Key${idx - 1}`,
    },
    {
      queryResult: 'hide',
      queryTarget: `Key${idx}numBins`,
      query: `parameters.Key${idx - 1}Type !== '"bin"'`,
    },
  ].filter(d => d);
  const cond = (query: string, tv: any): any => ({CONDITIONAL: {query, true: tv, deleteKeyOnFalse: true}});
  return {
    widgets,
    widgetValidations,
    layout: cond(!NEVER_HIDE ? `parameters.Key${idx - 1}` : 'true', {
      subgroup: {
        type: cond(`parameters.Key${idx}Type`, `[Key${idx}Type]`),
        key: cond(`parameters.Key${idx}`, `[Key${idx}]`),
        numBin: cond(`parameters.Key${idx}Type === '"bin"'`, `[Key${idx}numBins]`),
      },
      aspect_ratio: cond(`parameters.Key${idx}AspectRatio`, `[Key${idx}AspectRatio]`),
    }),
  };
}

const configurations = [1, 2, 3, 4, 5, 6].map(generateLevel);

/* eslint-disable @typescript-eslint/camelcase */
const ATOM_TEMPLATE: any = {
  layouts: configurations.map(d => d.layout),
  mark: {
    color: {
      key: '[colorBy]',
      type: 'categorical',
      scheme: '[colorScheme]',
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
      defaultVal: '"schemeCategory10"',
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
