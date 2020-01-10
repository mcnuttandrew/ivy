type DATA_MODS =
  | 'none'
  | 'holdout'
  | 'randomize'
  | 'full-bootstrap'
  | 'holdout-with-bootstrap';

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
export function shuffle(arr: any[]): any[] {
  const copyArr = arr.map((x: any) => x);
  for (let i = copyArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = copyArr[i];
    copyArr[i] = copyArr[j];
    copyArr[j] = x;
  }
  return copyArr;
}

const transpose = (m: any[]): any[] =>
  m[0].map((x: any, i: number) => m.map(x => x[i]));
function randomize(data: any): any[] {
  const shuffledColumns = Object.keys(data[0]).reduce(
    (acc: any, key: string) => {
      acc[key] = shuffle(data.map((row: any) => row[key]));
      return acc;
    },
    {},
  );
  const keys = Object.keys(shuffledColumns);
  return transpose(Object.values(shuffledColumns)).map((row: any) => {
    return row.reduce((acc: any, val: any, idx: number) => {
      acc[keys[idx]] = val;
      return acc;
    }, {});
  });
}

const repeat = (val: any, n: number): any[] => [...new Array(n)].map(() => val);
const zeros = (n: number): number[] => repeat(0, n);

// Cribbed from
// https://github.com/vega/datalib/blob/master/src/generate.js
// modified because uw's version assumes an input of numbers rather than objects
function bootstrap(inputData: any[]): any {
  // Generates a bootstrap sample from a set of observations.
  function sample(): any[] {
    return inputData[Math.floor(Math.random() * inputData.length)];
  }
  sample.samples = function samples(numSamples: number): any[] {
    return zeros(numSamples).map(sample);
  };
  return sample;
}

export function fullResample(inputData: any): any[] {
  return bootstrap(inputData).samples(inputData.length);
}

/* eslint-disable*/
export const selectDataModification = (data: any): DATA_MODS => {

  return 'none';
};
/* eslint-enable*/

export const executeDataModifcation = (
  data: any,
  modification: DATA_MODS,
): any => {
  if (modification === 'none') {
    return data;
  }
  if (modification === 'randomize') {
    return randomize(data);
  }
  return data;
};
