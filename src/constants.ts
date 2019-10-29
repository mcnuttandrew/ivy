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
    const newSpec = spec.setIn([...route, 'aggregate'], selectedOption);
    const addType = (x: any) => x.setIn([...route, 'type'], 'quantitative');
    const hasField = newSpec.getIn([...route, 'field']);
    return hasField ? newSpec : addType(newSpec);
  },
  optionGetter: spec => spec.getIn(['encoding', dimension, 'aggregate']),
  optionDefault: 'none',
  predicate: () => true,
});

const typeRoute = (dim: string) => ['encoding', dim, 'scale', 'type'];
const buildScaleOption = (dim: string): EncodingOption => ({
  optionType: 'Scale type',
  options: ['linear', 'log'].map(toOption),
  optionSetter: (spec, option) => spec.setIn(typeRoute(dim), option),
  optionGetter: spec => spec.getIn(typeRoute(dim)) || 'linear',
  optionDefault: 'linear',
  predicate: spec => Boolean(spec.getIn(['encoding', dim, 'field'])),
});

const typeCoerceRoute = (dim: string) => ['encoding', dim, 'type'];
const buildTypeCoercion = (dim: string): EncodingOption => ({
  optionType: 'Data type',
  options: ['nominal', 'ordinal', 'quantitative', 'temporal'].map(toOption),
  optionSetter: (spec, option) => spec.setIn(typeCoerceRoute(dim), option),
  optionGetter: spec => spec.getIn(typeCoerceRoute(dim)),
  optionDefault: undefined,
  predicate: () => true,
});

// started doing the remove zero story got bored
// function findExtentOfIntervals(filters, naturalDomain: [number, number]) {
//   return filters.reduce(([min, max]: [number, number], filter) => {
//     return [Math.max(min, filter.range[0]), Math.min(max, filter.range[1])];
//   }, naturalDomain);
// }
//
// const buildDomainSelection = (dim: string): EncodingOption => ({
//   optionType: 'Domain',
//   options: ['INCLUDE ZERO', 'ONLY SELECTED'].map(toOption),
//   optionSetter: (spec, option, column) => {
//     const field = spec.getIn(['encoding', dim, 'field']);
//     const domain = findExtentOfIntervals(
//       spec.get('transform').filter(filter => filter.get('field') === field),
//       column.domain,
//     );
//
//     // if (option === 'INCLUDE ZERO') {
//     //   domain =
//     // }
//     spec.setIn(['encoding', dim, 'scale', 'domain'], option);
//   },
//   optionGetter: spec => spec.getIn(typeCoerceRoute(dim)),
//   optionDefault: 'INCLUDE ZERO',
//   predicate: spec =>
//     spec.encoding[dim].field && spec.encoding[dim].type === 'quantitative',
// });

// take in an encoding option and create a predicate that rejects that option
// if that field is not present
type predicateInject = (dim: string, option: EncodingOption) => EncodingOption;
const injectFieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: (spec: any): boolean =>
    Boolean(spec.getIn(['encoding', dim, 'field'])),
});
const injectNofieldPred: predicateInject = (dim, option) => ({
  ...option,
  predicate: (spec: any): boolean =>
    !Boolean(spec.getIn(['encoding', dim, 'field'])),
});

const generateXorY = (dim: string) => [
  injectFieldPred(dim, buildTypeCoercion(dim)),
  buildScaleOption(dim),
  injectFieldPred(dim, buildSpatialOptions(dim, spatialAggs)),
  injectNofieldPred(dim, buildSpatialOptions(dim, justCountAgg)),
];

export const configurationOptions: any = {
  x: generateXorY('x'),
  y: generateXorY('y'),
  row: [injectFieldPred('row', buildTypeCoercion('row'))],
  column: [injectFieldPred('column', buildTypeCoercion('column'))],
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
