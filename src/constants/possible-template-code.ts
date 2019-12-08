// const example = {
//   metaData: {
//     name: 'Scatterplot',
//     description: 'A non-aggregate plot with a variable basis',
//     language: 'vega-lite'
//   },
//   variables: [
//     {
//       name: 'xDim',
//       type: 'DataTarget',
//       // data-target specific params
//       allowedTypes: ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'],
//       required: true,
//     },
//     {
//       name: 'yDim',
//       type: 'DataTarget',
//       // data-target specific params
//       allowedTypes: ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'],
//       required: true,
//     },
//     {
//       name: 'XzeroActive',
//       type: 'Switch',
//       // switch specific params
//       activeValue: 'true',
//       inactiveValue: 'false',
//       defaultsToActive: true,
//     },
//     {
//       name: 'YzeroActive',
//       type: 'Switch',
//       // switch specific params
//       activeValue: 'true',
//       inactiveValue: 'false',
//       defaultsToActive: true,
//     },
//   ],
//   // cues for the gui representation of the variables
//   // queryTarget denotes a particular variable, query denotes a partial state
//   // that is checked for in the  variable
//   invalidations: [
//     {queryTarget: 'XzeroActive', query: {xDim: null}},
//     {queryTarget: 'YzeroActive', query: {yDim: null}},
//   ],
//   // having each of the arguments listed here might be somewhat cumbersome if there are a lot?
//   program: (xDim, yDim, XzeroActive, YzeroActive) => ({
//     data: {value: 'cars.json'},
//     mark: {type: 'point', tooltip: true},
//     encoding: {
//       x: {field: xDim, type: 'quantitative', scale: {zero: XzeroActive}},
//       y: {field: yDim, type: 'quantitative', scale: {zero: YzeroActive}},
//     },
//   }),
// };
