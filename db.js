const mongoose = require('mongoose');
const isProduction = process.env.NODE_ENV === 'production';
mongoose.promise = global.Promise;

const mongodbUrl = isProduction ? 'mongodb://db:27017/oj' : 'mongodb://localhost:27017/oj';

function connectWithRetry() {
  mongoose.connect(mongodbUrl, {
    useNewUrlParser: true,
  });
}

connectWithRetry();

const db = mongoose.connection;

db.on('error', () => {
  console.log('connect to mongodb failed');
  setTimeout(connectWithRetry, 500);
});

db.once('open', function () {
  console.log('mongodb connected!');
});

if (!isProduction) {
  mongoose.set('debug', true);
}
