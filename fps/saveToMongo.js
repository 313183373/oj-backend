const problems = require('./fps-to-json');
const mongoose = require('mongoose');
require('../db');
require('../models/problem/Problem');
require('../models/submit/Submit');
require('../models/user/User');
const Problem = mongoose.model('Problem');

Problem.insertMany(problems).then(() => mongoose.connection.close());
