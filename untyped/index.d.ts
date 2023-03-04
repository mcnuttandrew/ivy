declare module 'type-analyzer';
declare module 'datalib';
declare module 'enzyme-adapter-react-16';

declare module 'vega-projection-extended';
declare module '*.md';
declare module '*.json' {
  const value: any;
  export default value;
}

// TODO i guess
//  {
//   // export type Data = {[key: string]: string}[];
//   export interface AnalyzerContainer {
//     computeColMeta(): (data: any, rules: any, options: any) => any;
//   }
//   // export interface Analyzer {
//   //   computeColMeta: ()
//   // }
//   //
//   // export interface DATA_TYPES {
//   //
//   // }
//   //
//   // export interface RegexList {
//   //
//   // }
// }
