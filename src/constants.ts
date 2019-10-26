import Immutable from 'immutable';

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
  'bin',
  'max',
  'median',
].map(toOption);

const buildSpatialOptions = (
  dimension: string,
  options: OptionValue[],
): EncodingOption => ({
  optionType: 'aggregate',
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
  options: ['linear', 'log'].map(x => ({display: x, value: x})),
  optionSetter: (spec, option) => spec.setIn(typeRoute(dim), option),
  optionGetter: spec => spec.getIn(typeRoute(dim)) || 'linear',
  optionDefault: 'linear',
  predicate: spec => Boolean(spec.getIn(['encoding', dim, 'field'])),
});

export const configurationOptions: any = {
  x: [buildSpatialOptions('x', spatialAggs), buildScaleOption('x')],
  y: [buildSpatialOptions('y', spatialAggs), buildScaleOption('y')],
  size: [buildSpatialOptions('size', binningOptions)],
};
