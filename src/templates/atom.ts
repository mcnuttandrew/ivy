import stringify from 'json-stringify-pretty-compact';
import {Widget, Template, GenWidget, SliderWidget, QueryResult} from '../types';
import {simpleList} from './polestar-template-utils';

const TYPES = ['groupby', 'bin', 'passthrough', 'gridxy', 'flatten'];
const ASPECT_RATIOS = ['square', 'parents', 'fillX', 'fillY', 'maxfill', 'custom'];
function generateLevel(idx: number): {widgets: GenWidget[]; layout: any} {
  const NEVER_HIDE = idx === 1;
  const widgets: GenWidget[] = [
    {
      name: `Key${idx}`,
      type: 'DataTarget',
      config: {allowedTypes: ['DIMENSION'], required: false},
      validations: [
        !NEVER_HIDE && {
          queryResult: 'hide' as QueryResult,
          queryTarget: `Key${idx}`,
          query: `!parameters.Key${idx - 1}`,
        },
      ].filter(d => d),
    },
    simpleList({
      name: `Key${idx}Type`,
      defaultVal: '"groupby"',
      displayName: `Key${idx}Type`,
      list: [...TYPES.map(d => ({display: d, value: `"${d}"`})), {display: 'null', value: 'null'}],
      validations: [
        !NEVER_HIDE && {queryResult: 'hide' as QueryResult, query: `!parameters.Key${idx - 1}`},
      ].filter(d => d),
    }),
    simpleList({
      name: `Key${idx}AspectRatio`,
      defaultVal: idx % 2 ? '"fillX"' : '"fillY"',
      displayName: `Key${idx}AspectRatio`,
      list: [...ASPECT_RATIOS.map(d => ({display: d, value: `"${d}"`})), {display: 'null', value: 'null'}],
      validations: [
        !NEVER_HIDE && {queryResult: 'hide' as QueryResult, query: `!parameters.Key${idx - 1}`},
      ].filter(d => d),
    }),
    {
      name: `Key${idx}numBins`,
      displayName: 'NumBins',
      type: 'Slider',
      config: {minVal: 1, maxVal: 15, step: 1, defaultValue: 10},
      validations: [{queryResult: 'hide', query: `parameters.Key${idx}Type !== '"bin"'`}],
    } as Widget<SliderWidget>,
  ];

  const cond = (query: string, tv: any): any => ({$cond: {query, true: tv, deleteKeyOnFalse: true}});
  return {
    widgets,
    layout: cond(!NEVER_HIDE ? `parameters.Key${idx - 1}` : 'true', {
      subgroup: {
        key: cond(`parameters.Key${idx}`, `[Key${idx}]`),
        type: cond(`parameters.Key${idx}Type`, `[Key${idx}Type]`),
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
    shape: '[Shape]',
  },
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
};
/* eslint-enable @typescript-eslint/camelcase */

const ATOM: Template = {
  templateName: 'AtomExplore',
  templateDescription:
    'A system for exploring unit visualizations, such as waffle plots and the like. Based on the work of Park et al.',
  templateLanguage: 'unit-vis',
  templateAuthor: 'HYDRA-AUTHORS',
  code: stringify(ATOM_TEMPLATE),
  widgets: [
    {name: 'colorBy', type: 'DataTarget', config: {allowedTypes: ['DIMENSION'], required: true}},
    simpleList({
      name: 'colorScheme',
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
    simpleList({
      name: `Shape`,
      defaultVal: '"circle"',
      list: ['circle', 'rect'].map(d => ({display: d, value: `"${d}"`})),
    }),
    ...configurations.reduce((acc, d) => acc.concat(d.widgets), []),
  ],
};
export default ATOM;
