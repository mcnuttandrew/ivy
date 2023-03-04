import {promises as fs} from 'fs';
const {Analyzer} = require('type-analyzer');
const {computeColMeta} = Analyzer;
const {csvParse, tsvParse} = require('d3-dsv');
const vegaDataSet = require('vega-datasets');

const csvReader = data => csvParse(data);
const jsonReader = data => JSON.parse(data);
const getReader = fileName => {
  if (fileName.includes('.tsv')) {
    return tsvParse;
  }
  if (fileName.includes('.csv')) {
    return csvReader;
  }
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return () => [];
};
function listAllColumns(table) {
  return Object.keys(
    table.reduce((acc, row) => {
      const cols = Object.keys(row);
      cols.forEach(col => {
        acc[col] = true;
      });
      return acc;
    }, {}),
  );
}

Promise.all(
  Object.keys(vegaDataSet).map(key => {
    return fs
      .getFile(`./node_modules/vega-datasets/data/${key}`)
      .then(d => getReader(key)(d))
      .then(file => [computeColMeta(file), file])
      .then(([colMeta, file]) => {
        const cols = colMeta.reduce(
          (acc, row) => {
            acc[row.category] = (acc[row.category] || 0) + 1;
            acc.columns.push(row.key);
            return acc;
          },
          {file: key, length: file.length, columns: []},
        );
        const colsFromAnalyzer = new Set(cols.columns);
        listAllColumns(file)
          .filter(col => !colsFromAnalyzer.has(col))
          .forEach(col => {
            // if it's missing set it to a default guess
            cols[col] = {
              key: col,
              label: col,
              type: 'STRING',
              category: 'DIMENSION',
              format: '',
            };
            cols.columns.push(col);
          });
        return cols;
      })
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
  fs.writeFile('./src/constants/vega-datasets-counts.json', JSON.stringify(fullCounts, null, 2));
});
