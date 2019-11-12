// i know this file is bad and crazy i feel bad
export interface OptionValue {
  display: string;
  value: string;
}
export type OptionType = 'Switch' | 'List';
export interface EncodingOption {
  optionName: string;
  optionType: OptionType;
  options?: OptionValue[];
  optionSetter: (spec: any, selectedOption: string | boolean) => any;
  optionGetter: (spec: any) => string | boolean;
  optionDefault: string | boolean;
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
  optionName: 'Agg.',
  optionType: 'List',
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

const binOption = (dim: string): EncodingOption => ({
  optionName: 'Bin',
  optionType: 'Switch',
  optionSetter: (spec, option) => set(spec, ['encoding', dim, 'bin'], option),
  optionGetter: spec => get(spec, ['encoding', dim, 'bin']),
  optionDefault: false,
  predicate: spec => {
    return (
      get(spec, ['encoding', dim, 'field']) &&
      channelTypePredicate(dim, ['quantitative', 'time'])(spec)
    );
  },
});

const channelTypePredicate = (dim: string, expected: string[]) => (
  spec: any,
) => {
  const channelType = get(spec, ['encoding', dim, 'type']);
  return expected.some((type: string) => channelType === type);
};

const typeRoute = (dim: string) => ['encoding', dim, 'scale', 'type'];
const buildScaleOption = (dim: string): EncodingOption => ({
  optionName: 'Scale type',
  optionType: 'List',
  options: ['linear', 'log'].map(toOption),
  optionSetter: (spec, option) => set(spec, typeRoute(dim), option),
  optionGetter: spec => get(spec, typeRoute(dim)) || 'linear',
  optionDefault: 'linear',
  predicate: spec => {
    return (
      get(spec, ['encoding', dim, 'field']) &&
      channelTypePredicate(dim, ['quantitative', 'time'])(spec)
    );
  },
});

const zeroDomainRoute = (dim: string) => ['encoding', dim, 'scale', 'zero'];

const scaleDomain = (dim: string): EncodingOption => ({
  optionName: 'Include Zero',
  optionType: 'Switch',
  optionSetter: (spec, option) => set(spec, zeroDomainRoute(dim), option),
  optionGetter: spec => {
    const val = get(spec, zeroDomainRoute(dim));
    return typeof val === 'boolean' ? val : true;
  },
  optionDefault: true,
  predicate: spec => {
    return (
      get(spec, ['encoding', dim, 'field']) &&
      channelTypePredicate(dim, ['quantitative', 'time'])(spec)
    );
  },
});

const buildTypeCoercion = (dim: string): EncodingOption => ({
  optionName: 'Data type',
  optionType: 'List',
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
  binOption(dim),
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
    injectFieldPred('size', binOption('size')),
  ],
  color: [
    injectFieldPred('color', buildTypeCoercion('color')),
    injectFieldPred('color', buildSpatialOptions('color', binningOptions)),
    injectNofieldPred('color', buildSpatialOptions('color', justCountAgg)),
    injectFieldPred('color', binOption('color')),
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
