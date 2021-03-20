const csv = require('csv-parser');
const fs = require('fs');
const readline = require('readline');
const { once } = require('events');

const newRows = [];
const fileStream = fs.createReadStream('./csv_files/answers.csv');
const writeStream = fs.createWriteStream('./updated_csv/cleanAnswers.csv', { flags: 'a' });

let first = true;
(async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {

      if (first) {
        writeStream.write(`${line.split(' ').join('')}\n`);
        first = false;
      } else {
        validate(line, (newLine) => {

          writeStream.write(`${newLine}\n`);
        });
      }

    });

    await once(rl, 'close');

    console.log('File processed.');
  } catch (err) {
    console.error(err);
  }
}());





const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidDate = (dateString) => {

  // Parse the date parts to integers
  var parts = dateString.split('-');
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month === 0 || month > 12) { return false; }

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) { monthLength[1] = 29; }

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

const validate = (row, cb) => {
  let sendRow = true;
  const column = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

  const rowVals = [column[0], column[1], column[2], column[3], column[4], column[5]];
  // const rowVals = [row.id, row[' question_id'], row[' body'], row[' date_written'], row[' answerer_name'], row[' answerer_email']];
  const checkNotNull = rowVals.every(val => { return val !== null; });

  if (Number(column[0]) < 1) {
    sendRow = false;
  }
  if (Number(column[1]) < 1) {
    sendRow = false;
  }

  if (column[2].length > 1000) {
    sendRow = false;
  }

  if (!isValidDate(column[3]) ) {
    sendRow = false;
  }

  if (column[4].length > 60) {
    sendRow = false;
  }

  if (column[5].length > 60 && !validateEmail(column[5])) {
    sendRow = false;
  }

  if (Number(column[6]) > 0) {
    sendRow = false;
  }
  if (sendRow) {
    const newRow = `${column[0]},${column[1]},${column[2]},${column[3]},${column[4]},${column[5]},${false},${column[7]}`
      // const newRow = {
      //   id: column[0],
      //   question_id: column[1],
      //   body: `'${column[2]}'`,
      //   date_written: column[3],
      //   answerer_name: `'${column[4]}'`,
      //   answerer_email: `'${column[4]}'`,
      //   reported: true,
      //   helpful: column[7],
      // };
    cb(newRow)
  }
}


// const rows = [];

// let done = true
// fs.createReadStream('./updated_csv/cleanAnswers.csv')
//   .pipe(csv())
//   .on('data', function (row) {


//     if (done) {
//       rows.push(row);
//     }
//     done = false;
//   })
//   .on('end', function () {
//     console.log(rows)
//   });
