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
  spec.getIn(['spec']) ? ['spec', ...route] : route;

const set = (spec: any, route: string[], value: any): any =>
  spec.setIn(maybePrefixWithSpec(spec, route), value);

const get = (spec: any, route: string[]): any =>
  spec.getIn(maybePrefixWithSpec(spec, route));

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
    const route = ['encoding', dimension];
    const newSpec = set(spec, [...route, 'aggregate'], selectedOption);
    const addType = (x: any) => set(x, [...route, 'type'], 'quantitative');
    return get(newSpec, [...route, 'field']) ? newSpec : addType(newSpec);
  },
  optionGetter: spec => get(spec, ['encoding', dimension, 'aggregate']),
  optionDefault: 'none',
  predicate: () => true,
});

const typeRoute = (dim: string) => ['encoding', dim, 'scale', 'type'];
const buildScaleOption = (dim: string): EncodingOption => ({
  optionType: 'Scale type',
  options: ['linear', 'log'].map(toOption),
  optionSetter: (spec, option) => set(spec, typeRoute(dim), option),
  optionGetter: spec => get(spec, typeRoute(dim)) || 'linear',
  optionDefault: 'linear',
  predicate: spec => !!get(spec, ['encoding', dim, 'field']),
});

const zeroDomainRoute = (dim: string) => ['encoding', dim, 'scale', 'zero'];
const scaleDomain = (dim: string): EncodingOption => ({
  optionType: 'Domain',
  options: [
    {display: 'Include Zero', value: 'true'},
    {display: 'Dont Include Zero', value: 'false'},
  ],
  optionSetter: (spec, option) =>
    set(spec, zeroDomainRoute(dim), option === 'true'),
  optionGetter: spec => `${get(spec, zeroDomainRoute(dim))}`,
  optionDefault: 'true',
  predicate: spec => {
    if (!get(spec, ['encoding', dim, 'field'])) {
      return false;
    }
    const channelType = get(spec, ['encoding', dim, 'type']);
    return channelType === 'quantitative' || channelType === 'time';
  },
});

const buildTypeCoercion = (dim: string): EncodingOption => ({
  optionType: 'Data type',
  options: ['nominal', 'ordinal', 'quantitative', 'temporal'].map(toOption),
  optionSetter: (spec, option) => set(spec, ['encoding', dim, 'type'], option),
  optionGetter: spec => get(spec, ['encoding', dim, 'type']),
  optionDefault: undefined,
  predicate: () => true,
});

// take in an encoding option and create a predicate that rejects that option
// if that field is not present
type predicateInject = (dim: string, option: EncodingOption) => EncodingOption;
const injectFieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: spec => !!get(spec, ['encoding', dim, 'field']),
});
const injectNofieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: spec => !get(spec, ['encoding', dim, 'field']),
});

const generateXorY = (dim: string) => [
  injectFieldPred(dim, buildTypeCoercion(dim)),
  buildScaleOption(dim),
  scaleDomain(dim),
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
