const {getFile} = require('hoopoe');
const {tsvParse} = require('d3-dsv');
getFile('./backups/Ivy-Gallery-Rebuild.tsv')
  .then(x => tsvParse(x))
  .then(instances => {
    const solvedInstances = instances.filter(row => row.Instance).map(x => x.Title);
    console.log(
      `
const done = new Set(${JSON.stringify(solvedInstances)});
[...document.querySelectorAll('.imagegroup')].forEach(node => {
  if (done.has(node.textContent.trim())) {
    node.setAttribute('style', 'opacity:0.2');
  }
});
      `,
    );
  });
