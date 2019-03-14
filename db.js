const mongoose = require('mongoose');
mongoose.promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/oj', {
    useNewUrlParser: true
});

const db = mongoose.connection;

const isProduction = process.env.NODE_ENV === 'production';

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('mongodb connected!');
});

if (!isProduction) {
    mongoose.set('debug', true);
}
