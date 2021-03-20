const csv = require('csv-parser');
const fs = require('fs');

const newRows = [];
const filepath = './csv_files/questions.csv';
let endFile = './updated_csv/cleanQuestions.csv';

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidDate = (dateString) => {
  // First check for the pattern
  // if (!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateString)) { return false; }

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

fs.createReadStream(filepath)
  .pipe(csv())
  .on('data', function (row) {

    let sendRow = true;
    const rowVals = [row.id, row.product_id, row.body, row.date_written, row.asker_name, row.asker_email];
    const checkNotNull = rowVals.every(val => { return val !== null; });

    if (row.id < 1) {
      sendRow = false;
    }
    if (row.product_id < 1) {
      sendRow = false;
    }

    if (row.body.length > 1000) {
      sendRow = false;
    }

    if (!isValidDate(row.date_written) ) {
      sendRow = false;
    }

    if (row.asker_name > 60) {
      sendRow = false;
    }

    if (row.asker_email.length > 60 && !validateEmail(row.asker_email)) {
      sendRow = false;
    }

    if (row.reported > 0) {
      sendRow = false;
    }

    if (sendRow) {
      const newRow = {
        id: row.id,
        product_id: row.product_id,
        body: `"${row.body}"`,
        date_written: row.date_written,
        asker_name: `"${row.asker_name}"`,
        asker_email: `"${row.asker_email}"`,
        reported: false,
        helpful: row.helpful,
      };
      newRows.push(newRow);
    }

  })
  .on('end', function () {
    // console.table(users);
    writeToCSVFile(newRows);
    // TODO: SAVE users data to another file
  });


const writeToCSVFile = (newRows) => {
  const filename = endFile;
  fs.writeFile(endFile, extractAsCSV(newRows), err => {
    if (err) {
      console.log('Error writing to csv file', err);
    } else {
      console.log(`saved as ${filename}`);
    }
  });
};

const extractAsCSV = (newRows) => {
  const header = ['id, product_id, body, date_written, asker_name, asker_email, reported, helpful'];
  const rows = newRows.map(row =>
    `${row.id},${row.product_id},${row.body},${row.date_written},${row.asker_name},${row.asker_email},${row.reported},${row.helpful}`
  );
  return header.concat(rows).join('\n');
};


// id: row.id,
//       product_id: row.product_id,
//       body: row.body,
//       date_written: row.date_written,
//       asker_name: row.asker_name,
//       asker_email: row.asker_email,
//       reported: row.reported,
//       helpful: row.helpful,


// var data = fs.readFileSync(filepath, 'utf8');
// var lines = data.split('\n');



// const get_line = (filename, line_no, callback) => {
//   var data = fs.readFileSync(filename, 'utf8');
//   var lines = data.split('\n');

//   if (+line_no > lines.length) {
//     throw new Error('File end reached without finding line');
//   }

//   callback(null, lines[+line_no]);
// }

// get_line(filepath, 9, function(err, line) {
//   console.log('The line: ' + line);
// });