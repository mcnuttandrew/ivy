// i know this file is bad and crazy i feel bad
export interface OptionValue {
  display: string;
  value: string;
}
export interface EncodingOption {
  optionType: string;
  options: OptionValue[];
  optionSetter: (spec: any, selectedOption: string) => any;
  optionGetter: (spec: any) => string;
  optionDefault: string;
  predicate: (spec: any) => boolean;
}

import {VegaMark} from './types';
export const marks: VegaMark[] = [
  'arc',
  'area',
  // 'image',
  // 'group',
  // 'line',
  // 'path',
  'rect',
  // 'rule',
  // 'shape',
  'symbol',
  'text',
  // 'trail',
];

// check if using the nested spec mode, if so, re-route into that subspec
const maybePrefixWithSpec = (spec: any, route: string[]): string[] =>
  Boolean(spec.getIn(['spec'])) ? ['spec', ...route] : route;

const justCountAgg = [
  {display: 'none', value: undefined},
  {display: 'count', value: 'count'},
];
const spatialAggs = [
  ...justCountAgg,
  {display: 'min', value: 'min'},
  {display: 'max', value: 'max'},
  {display: 'sum', value: 'sum'},
  {display: 'mean', value: 'mean'},
  {display: 'median', value: 'median'},
  {display: 'mode', value: 'mode'},
];
const toOption = (x: string): OptionValue => ({display: x, value: x});
const binningOptions = [
  'none',
  'count',
  'min',
  'mean',
  'sum',
  'bin', // TODO bin is handled incorrectly
  'max',
  'median',
].map(toOption);

const buildSpatialOptions = (
  dimension: string,
  options: OptionValue[],
): EncodingOption => ({
  optionType: 'Agg.',
  options,
  optionSetter: (spec, selectedOption) => {
    const route = maybePrefixWithSpec(spec, ['encoding', dimension]);
    const newSpec = spec.setIn([...route, 'aggregate'], selectedOption);
    const addType = (x: any) => x.setIn([...route, 'type'], 'quantitative');
    const hasField = newSpec.getIn([...route, 'field']);
    return hasField ? newSpec : addType(newSpec);
  },
  optionGetter: spec => {
    const route = maybePrefixWithSpec(spec, [
      'encoding',
      dimension,
      'aggregate',
    ]);
    return spec.getIn(route);
  },
  optionDefault: 'none',
  predicate: () => true,
});

const typeRoute = (dim: string) => ['encoding', dim, 'scale', 'type'];
const buildScaleOption = (dim: string): EncodingOption => ({
  optionType: 'Scale type',
  options: ['linear', 'log'].map(toOption),
  optionSetter: (spec, option) =>
    spec.setIn(maybePrefixWithSpec(spec, typeRoute(dim)), option),
  optionGetter: spec =>
    spec.getIn(maybePrefixWithSpec(spec, typeRoute(dim))) || 'linear',
  optionDefault: 'linear',
  predicate: spec =>
    Boolean(spec.getIn(maybePrefixWithSpec(spec, ['encoding', dim, 'field']))),
});

const buildCoerceRoute = (spec: any, dim: string): string[] =>
  maybePrefixWithSpec(spec, ['encoding', dim, 'type']);
const buildTypeCoercion = (dim: string): EncodingOption => ({
  optionType: 'Data type',
  options: ['nominal', 'ordinal', 'quantitative', 'temporal'].map(toOption),
  optionSetter: (spec, option) =>
    spec.setIn(buildCoerceRoute(spec, dim), option),
  optionGetter: spec => spec.getIn(buildCoerceRoute(spec, dim)),
  optionDefault: undefined,
  predicate: () => true,
});

// take in an encoding option and create a predicate that rejects that option
// if that field is not present
type predicateInject = (dim: string, option: EncodingOption) => EncodingOption;
const buildPredRoute = (spec: any, dim: string): string[] =>
  maybePrefixWithSpec(spec, ['encoding', dim, 'field']);
const injectFieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: (spec: any): boolean => !!spec.getIn(buildPredRoute(spec, dim)),
});
const injectNofieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: (spec: any): boolean => !spec.getIn(buildPredRoute(spec, dim)),
});

const generateXorY = (dim: string) => [
  injectFieldPred(dim, buildTypeCoercion(dim)),
  buildScaleOption(dim),
  injectFieldPred(dim, buildSpatialOptions(dim, spatialAggs)),
  injectNofieldPred(dim, buildSpatialOptions(dim, justCountAgg)),
];

// the configuration options consumed by the encoding panel
export const configurationOptions: any = {
  x: generateXorY('x'),
  y: generateXorY('y'),
  'row-meta': [],
  'column-meta': [],
  'repeat-meta': [],

  // repeaters
  facet: [injectFieldPred('facet', buildTypeCoercion('facet'))],
  row: [injectFieldPred('row', buildTypeCoercion('row'))],
  column: [injectFieldPred('column', buildTypeCoercion('column'))],
  // marks
  size: [
    injectFieldPred('size', buildTypeCoercion('size')),
    injectFieldPred('size', buildSpatialOptions('size', binningOptions)),
    injectNofieldPred('size', buildSpatialOptions('size', justCountAgg)),
  ],
  color: [
    injectFieldPred('color', buildTypeCoercion('color')),
    injectFieldPred('color', buildSpatialOptions('color', binningOptions)),
    injectNofieldPred('color', buildSpatialOptions('color', justCountAgg)),
  ],
  shape: [
    injectFieldPred('shape', buildTypeCoercion('shape')),
    injectFieldPred('shape', buildSpatialOptions('shape', binningOptions)),
  ],
  detail: [
    injectFieldPred('detail', buildTypeCoercion('detail')),
    injectFieldPred('detail', buildSpatialOptions('detail', binningOptions)),
  ],
  text: [
    injectFieldPred('text', buildTypeCoercion('text')),
    injectFieldPred('text', buildSpatialOptions('text', binningOptions)),
    injectNofieldPred('text', buildSpatialOptions('text', justCountAgg)),
  ],
};
