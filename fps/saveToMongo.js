const mongoose = require('mongoose');
require('../db');
require('../models/problem/Problem');
const Problem = mongoose.model('Problem');

module.exports = function (problems) {
    Problem.insertMany(problems).then(() => mongoose.connection.close());
};
