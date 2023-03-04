import {promises as fs} from 'fs';
const {tsvParse, csvParse} = require('d3-dsv');
const allowCol = new Set([
  // 'Bureau ID',
  // 'Link',
  // 'Image',
  'President',
  // 'Date',
  'Year',
  // 'Time',
  // 'Time Period',
  'Description',
  // 'Short Summary',
  // 'Location',
  // 'Area',
  // 'Mapping Location',
  // 'al-Qaeda/Taliban Killed',
  // 'al-Qaeda Killed',
  'Taliban Killed',
  'Target',
  'Target Group',
  'Target Certainty',
  'Westerners involved',
  'Named Victims',
  // 'Total Killed (Minimum)',
  // 'Total Killed (Maximum)',
  'Total Killed (Median)',
  // 'Civilians Killed (Minimum)',
  // 'Civilians Killed (Maximum)',
  'Civilians Killed (Median)',
  // 'Injured (Minumum)',
  // 'Injured (Maximum)',
  'Injured (Median)',
  // 'Children Killed (Minimum)',
  // 'Children Killed (Maximum)',
  'Children Killed (Median)',
  // 'All Targets (Minimum)',
  // 'All Targets (Maximum)',
  'All Targets (Median)',
  // 'Domestic Buildings (Minimum)',
  // 'Domestic Buildings (Maximum)',
  'Domestic Buildings (Median)',
  // 'Religious Buildings (Minimum)',
  // 'Religious Buildings (Maximum)',
  'Religious Buildings (Median)',
  // 'Other Buildings (Minimum)',
  // 'Other Buildings (Maximum)',
  'Other Buildings (Median)',
  // 'Vehicles (Minimum)',
  // 'Vehicles (Maximum)',
  'Vehicles (Median)',
  'Structural Damage',
  // 'Missiles Reported Fired (Minimum)',
  // 'Missiles Reported Fired (Maximum)',
  'Missiles Reported Fired (Median)',
  // 'References',
]);
fs.getFile('./collected-data/Strikes-dirty.csv')
  .then(csvParse)
  .then(d => {
    const mappedData = d.map(row => {
      return Object.entries(row).reduce((acc, [key, val]) => {
        if (!allowCol.has(key)) {
          return acc;
        }
        acc[key.split(' (Median)')[0] || key] = val;
        return acc;
      }, {});
    });
    fs.writeFile('./collected-data/drone-strikes.json', JSON.stringify(mappedData, null, 2));
  });

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
// const allowedFileds = {
//   Date: true,
//   Name: true,
//   Age: true,
//   Sex: true,
//   Race: true,
//   Victims: true,
//   State: true,
//   Region: false,
//   Method: true,
//   Juvenile: true,
//   Federal: true,
//   Volunteer: false,
//   ForeignNational: true,
//   County: true,
//   StateAbbreviation: false,
//   FullCounty: false,
// };
// const mappers = {
//   // Date: 'DateObject[{1990, 5, 4}, "Day", "Gregorian", -5.]',
//   Date: d =>
//     d
//       .split(/\{|\}/)[1]
//       .split(', ')
//       .join('-'),
//   // Age: 'Quantity[43, "Years"]',
//   Age: d => Number(d.split(/(Quantity\[)|\,/)[2]),
//   // State: 'Entity["AdministrativeDivision", {"Florida", "UnitedStates"}]',
//   State: d => {
//     const pretrimmed = d.split(/\{|,/)[2];
//     return pretrimmed.slice(1, pretrimmed.length - 1);
//   },
//   // FullCounty: 'Entity["AdministrativeDivision", {"BradfordCounty", "Florida", "UnitedStates"}]',
//   FullCounty: d => d.split(/(\{")|(",)/)[6],
// };
// getFile('./collected-data/american-executions.tsv')
//   .then(tsvParse)
//   .then(d => {
//     const mappedData = d.map(row => {
//       return Object.entries(row).reduce((acc, [key, val]) => {
//         if (!allowedFileds[key]) {
//           return acc;
//         }
//         acc[key] = mappers[key] ? mappers[key](val) : val;
//         return acc;
//       }, {});
//     });
//     writeFile('./collected-data/american-executions.json', JSON.stringify(mappedData, null, 2));
//   });
