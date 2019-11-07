import Immutable from 'immutable';
export const splom = Immutable.fromJS({
  data: {name: 'myData'},
  repeat: {
    row: ['petalWidth', 'petalLength', 'sepalWidth', 'sepalLength'],
    column: ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'],
  },
  spec: {
    width: 150,
    height: 150,
    mark: {type: 'point', tooltip: true},
    encoding: {
      x: {
        field: {repeat: 'column'},
        type: 'quantitative',
        scale: {zero: false},
      },
      y: {
        field: {repeat: 'row'},
        type: 'quantitative',
        scale: {zero: false},
      },
      color: {field: 'species', type: 'nominal'},
    },
  },
  config: {background: 'white'},
});
