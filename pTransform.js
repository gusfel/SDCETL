/* eslint-disable camelcase */
const csv = require('csv-parser');
const fs = require('fs');

const newRows = [];
const filepath = './csv_files/answers_photos.csv';
let endFile = './updated_csv/cleanPhotos.csv';

const isValidURL = (string) => {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
};


fs.createReadStream(filepath)
  .pipe(csv())
  .on('data', function (row) {

    let sendRow = true;
    const rowVals = [row.id, row.product_id, row.body, row.date_written, row.asker_name, row.asker_email];
    const checkNotNull = rowVals.every(val => { return val !== null; });

    if (Number(row.id) < 1) {
      sendRow = false;
    }
    if (Number(row.answer_id) < 1) {
      sendRow = false;
    }

    if (!isValidURL(row.url)) {
      sendRow = false;
    }

    // id,answer_id,url
    if (sendRow) {
      const newRow = {
        id: row.id,
        answer_id: row.answer_id,
        url: row.url
      };
      newRows.push(newRow);
    }

  })
  .on('end', function () {
    writeToCSVFile(newRows);
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
  const header = ['id,answer_id,url'];
  const rows = newRows.map(row =>
    `${row.id},${row.answer_id},${row.url}`
  );
  return header.concat(rows).join('\n');
};
