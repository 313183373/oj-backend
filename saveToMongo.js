const problems = require('./fps-to-json');
const mongoose = require('mongoose');
require('./db');
require('./problem/Problem');
require('./submit/Submit');
require('./user/User');
const Problem = mongoose.model('Problem');

Problem.insertMany(problems).then(() => mongoose.connection.close());
