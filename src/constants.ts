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
  predicate: (spec: any) => Boolean;
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

const spatialAggs = [
  {display: 'none', value: undefined},
  {display: 'count', value: 'count'},
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
const injectFieldPredicate = (
  dim: string,
  option: EncodingOption,
): EncodingOption => ({
  ...option,
  predicate: (spec: any) => Boolean(spec.getIn(['encoding', dim, 'field'])),
});

export const configurationOptions: any = {
  x: [
    buildTypeCoercion('x'),
    buildScaleOption('x'),
    buildSpatialOptions('x', spatialAggs),
  ],
  y: [
    buildTypeCoercion('y'),
    buildScaleOption('y'),
    buildSpatialOptions('y', spatialAggs),
  ],
  row: [injectFieldPredicate('row', buildTypeCoercion('row'))],
  column: [injectFieldPredicate('column', buildTypeCoercion('column'))],
  size: [
    injectFieldPredicate('size', buildTypeCoercion('size')),
    injectFieldPredicate('size', buildSpatialOptions('size', binningOptions)),
  ],
  color: [
    injectFieldPredicate('color', buildTypeCoercion('color')),
    injectFieldPredicate('color', buildSpatialOptions('color', binningOptions)),
  ],
  shape: [
    injectFieldPredicate('shape', buildTypeCoercion('shape')),
    injectFieldPredicate('shape', buildSpatialOptions('shape', binningOptions)),
  ],
  detail: [
    injectFieldPredicate('detail', buildTypeCoercion('detail')),
    injectFieldPredicate(
      'detail',
      buildSpatialOptions('detail', binningOptions),
    ),
  ],
  text: [
    injectFieldPredicate('text', buildTypeCoercion('text')),
    injectFieldPredicate('text', buildSpatialOptions('text', binningOptions)),
  ],
};
