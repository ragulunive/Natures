const fs = require('fs');
// console.log(process.argv);

// console.log(`${__dirname}/..`);
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8')
);
console.log(tours);
