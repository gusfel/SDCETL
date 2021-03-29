/* eslint-disable camelcase */
const get_line = (filename, line_no, callback) => {
  var data = fs.readFileSync(filename, 'utf8');
  var lines = data.split('\n');

  if (+line_no > lines.length) {
    throw new Error('File end reached without finding line');
  }

  callback(null, lines[+line_no]);
};

get_line(filepath, 9, function(err, line) {
  console.log('The line: ' + line);
});

module.exports = get_line;