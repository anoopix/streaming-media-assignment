const fs = require('fs');
const path = require('path');

// const page1 = fs.readFileSync(`${__dirname}/../client/client.html`);
// const page2 = fs.readFileSync(`${__dirname}/../client/client2.html`);
// const page3 = fs.readFileSync(`${__dirname}/../client/client3.html`);

function ifError(err, response) {
  if (err) {
    if (err.code === 'ENOENT') {
      response.writeHead(404);
    }
    return response.end(err);
  }

  return 0;
}

function getPositions(request) {
  let { range } = request.headers;

  if (!range) {
    range = 'bytes=0-';
  }

  const positions = range.replace(/bytes=/, '').split('-');
  return positions;
}

function getStream(positions, stats, response, fileType, file) {
  let start = parseInt(positions[0], 10);

  const total = stats.size;
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

  if (start > end) {
    start = end - 1;
  }

  const chunkSize = (end - start) + 1;

  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': fileType,
  });

  const stream = fs.createReadStream(file, { start, end });

  return stream;
}

function loadFile(request, response, filePath, fileType) {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    ifError(err, response);

    const positions = getPositions(request);

    const stream = getStream(positions, stats, response, fileType, file);

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
}

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
