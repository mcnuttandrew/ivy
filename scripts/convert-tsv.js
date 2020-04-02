const {getFile, writeFile} = require('hoopoe');
const {tsvParse} = require('d3-dsv');

// const dataRow = 'GEO,UNIT,SEX,AGE,ICD10\\TIME';
// const dataCols = ['GEO', 'UNIT', 'SEX', 'AGE', 'ICD10\\TIME'];
// const cols = ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010'];
// getFile('./collected-data/hlth_cd_anr_1.tsv')
//   .then(tsvParse)
//   .then(d => {
//     const output = d.reduce((acc, row) => {
//       const rowData = row[dataRow].split(',').reduce((mem, d, idx) => {
//         // console.log(d);
//         mem[dataCols[idx] === 'ICD10\\TIME' ? 'ICD10' : dataCols[idx]] = d;
//         return mem;
//       }, {});
//       cols.forEach(year => {
//         const newRow = {...rowData, year, count: Number(row[year].replace(/,/g, ''))};
//         acc.push(newRow);
//       });
//       return acc;
//     }, []);
//     writeFile('deaths.json', JSON.stringify(output, null, 2));
//   });
const mappers = {
  // Date: 'DateObject[{1990, 5, 4}, "Day", "Gregorian", -5.]',
  Date: d =>
    d
      .split(/\{|\}/)[1]
      .split(', ')
      .join('-'),
  // Age: 'Quantity[43, "Years"]',
  Age: d => Number(d.split(/(Quantity\[)|\,/)[2]),
  // State: 'Entity["AdministrativeDivision", {"Florida", "UnitedStates"}]',
  State: d => {
    const pretrimmed = d.split(/\{|,/)[2];
    return pretrimmed.slice(1, pretrimmed.length - 1);
  },
  // FullCounty: 'Entity["AdministrativeDivision", {"BradfordCounty", "Florida", "UnitedStates"}]',
  FullCounty: d => d.split(/(", ")/)[2],
};
getFile('./collected-data/american-executions.tsv')
  .then(tsvParse)
  .then(d => {
    const mappedData = d.map(row => {
      return Object.entries(row).reduce((acc, [key, val]) => {
        acc[key] = mappers[key] ? mappers[key](val) : val;
        return acc;
      }, {});
    });
    writeFile('american-executions-clean.json', JSON.stringify(mappedData, null, 2));
  });
