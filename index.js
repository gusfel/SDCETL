const fs = require('fs');

let writeStream = fs.createWriteStream('testFile.txt');

// write some data with a base64 encoding
writeStream.write('aef35ghhjdk74hja83ksnfjk888sfsf');

// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
  console.log('wrote all data to file');
});

// close the stream
writeStream.end();

fs.readFile('testFile.txt', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});