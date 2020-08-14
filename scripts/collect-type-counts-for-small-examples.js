const {getFile, writeFile, executeCommandLineCmd} = require('hoopoe');
const {Analyzer} = require('type-analyzer');
const {computeColMeta} = Analyzer;

const jsonReader = data => JSON.parse(data);
const getReader = fileName => {
  if (fileName.includes('.json')) {
    return jsonReader;
  }
  return () => [];
};
executeCommandLineCmd('ls example-datasets')
  .then(({stdout}) => stdout.split('\n').filter(d => d))
  .then(datasets => {
    Promise.all(
      datasets.map(key => {
        return getFile(`./example-datasets/${key}`)
          .then(d => getReader(key)(d))
          .then(file => [computeColMeta(file), file])
          .then(([colMeta, file]) =>
            colMeta.reduce(
              (acc, row) => {
                acc[row.category] = (acc[row.category] || 0) + 1;
                acc.columns.push(row.key);
                return acc;
              },
              {file: key, length: file.length, columns: []},
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
      writeFile('./src/constants/small-example-datasets-counts.json', JSON.stringify(fullCounts, null, 2));
    });
  });
