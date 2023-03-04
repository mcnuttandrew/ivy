import {promises as fs} from 'fs';
const {exec} = require('child_process');
const {Analyzer} = require('type-analyzer');
const {computeColMeta} = Analyzer;

function executeCommandLineCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}

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
        return fs
          .getFile(`./example-datasets/${key}`)
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
      fs.writeFile('./src/constants/small-example-datasets-counts.json', JSON.stringify(fullCounts, null, 2));
    });
  });
