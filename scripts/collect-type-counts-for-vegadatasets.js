const {getFile, writeFile} = require('hoopoe');
const {Analyzer} = require('type-analyzer');
const {computeColMeta} = Analyzer;
const vegaDataSet = require('vega-datasets');

Promise.all(
  Object.keys(vegaDataSet).map(key => {
    if (key.includes('.csv')) {
      // console.log('csv', key);
      return;
    }
    return getFile(`./node_modules/vega-datasets/data/${key}`)
      .then(d => JSON.parse(d))
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
  writeFile(
    './src/constants/vega-datasets-counts.json',
    JSON.stringify(fullCounts, null, 2),
  );
  // const fullCounts = results
  //   .filter(d => d)
  //   .reduce((acc, row) => {
  //     Object.entries(row).forEach(([category, count]) => {
  //       acc[category] = (acc[category] || 0) + count;
  //     });
  //     return acc;
  //   }, {filesCounted: });
  // console.log(fullCounts);
});
