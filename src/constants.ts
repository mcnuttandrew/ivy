import Immutable from 'immutable';

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

export interface EncodingOption {
  optionType: string;
  options: {display: string, value: string}[];
  optionSetter: (spec: any, selectedOption: string) => any;
  optionGetter: (spec: any) => string;
  predicate: (spec: any) => Boolean;
}

const buildSpatialOptions = (dimension: string): EncodingOption => ({
  optionType: 'aggregate',
  options: spatialAggs,
  optionSetter: (spec, selectedOption) => {
    const route = ['encoding', dimension];
    const newSpec = spec.setIn([...route, 'aggregate'], selectedOption);
    const addType = (x: any) => x.setIn([...route, 'type'], 'quantitative');
    const hasField = newSpec.getIn([...route, 'field']);
    return hasField ? newSpec : addType(newSpec);
  },
  optionGetter: spec => spec.getIn(['encoding', dimension, 'aggregate']),
  predicate: () => true,
});

const typeRoute = (dim: string) => ['encoding', dim, 'scale', 'type'];
const buildScaleOption = (dim: string): EncodingOption => ({
  optionType: 'Scale type',
  options: ['linear', 'log'].map(x => ({display: x, value: x})),
  optionSetter: (spec, option) => spec.setIn(typeRoute(dim), option),
  optionGetter: spec => spec.getIn(typeRoute(dim)) || 'linear',
  predicate: spec => Boolean(spec.getIn(['encoding', dim, 'field'])),
});

export const configurationOptions: any = {
  x: [buildSpatialOptions('x'), buildScaleOption('x')],
  y: [buildSpatialOptions('y'), buildScaleOption('y')],
};
