const {getFile, writeFile} = require('hoopoe');
const {tsvParse} = require('d3-dsv');

getFile('./backups/backup-ive-be-vl.json')
  .then(x => JSON.parse(x).templates.rows)
  .then(templates => {
    const templateMap = templates.reduce((acc, row) => {
      if (!acc[row.name]) {
        acc[row.name] = row;
      }
      if (new Date(acc[row.name].created_at) < new Date(row.created_at)) {
        acc[row.name] = row;
      }
      return acc;
    }, {});

    const templateComplexityMap = Object.values(templateMap)
      .map(({template}) => template)
      .reduce((acc, row) => {
        //   a really dumb complexity metric
        acc[row.templateName] =
          row.widgets.length +
          (row.code.match(/\$cond/g) || []).length +
          (row.code.match(/\$if/g) || []).length;
        return acc;
      }, {});
    getFile('./backups/Ivy-Gallery-Rebuild.tsv')
      .then(x => tsvParse(x))
      .then(instances => {
        const templateCounts = {};
        const solvedInstances = instances
          .filter(row => row.Call)
          .map((row, idx) => {
            const name = row['Short Template Name'];
            templateCounts[name] = (templateCounts[name] || 0) + 1;
            return {
              complexity: templateComplexityMap[name],
              templateName: name,
              exampleName: `${row.Title}-${idx}`,
            };
          })
          .map(row => {
            return {...row, normedComplexity: row.complexity / templateCounts[row.templateName]};
          });
        writeFile('./backups/solution-complexities.json', JSON.stringify(solvedInstances));
      });
    // console.log(templates.length);
  });
