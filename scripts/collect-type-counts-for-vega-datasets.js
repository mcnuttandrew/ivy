const {getFile, writeFile} = require('hoopoe');
const {Analyzer} = require('type-analyzer');
const {csvParse} = require('d3-dsv');
const {computeColMeta} = Analyzer;
const vegaDataSet = require('vega-datasets');

const csvReader = data => csvParse(data);
const jsonReader = data => JSON.parse(data);
const getReader = fileName => {
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return () => [];
};
Promise.all(
  Object.keys(vegaDataSet).map(key => {
    return getFile(`./node_modules/vega-datasets/data/${key}`)
      .then(d => getReader(key)(d))
      .then(file => [computeColMeta(file), file])
      .then(([colMeta, file]) =>
        colMeta.reduce(
          (acc, row) => {
            acc[row.category] = (acc[row.category] || 0) + 1;
            return acc;
          },
          {file: key, length: file.length},
        ),
      )
      .catch(e => {
        console.log(`FAILED TO COUNT ${key}`, e);
      });
  }),
).then(results => {
  const fullCounts = results
    .filter(d => d)
    .reduce((acc, row) => {
      acc[row.file] = row;
      return acc;
    }, {});
  writeFile('./src/constants/vega-datasets-counts.json', JSON.stringify(fullCounts, null, 2));
});
