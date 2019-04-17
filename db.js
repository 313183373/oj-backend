const mongoose = require('mongoose');
const isProduction = process.env.NODE_ENV === 'production';
mongoose.promise = global.Promise;

if(isProduction) {
    mongoose.connect('mongodb://db:27017/oj', {
        useNewUrlParser: true
    });
} else {
    mongoose.connect('mongodb://localhost:27017/oj', {
        useNewUrlParser: true
    });

}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('mongodb connected!');
});

if (!isProduction) {
    mongoose.set('debug', true);
}
