const mongoose = require('mongoose');

const ProblemScheme = new mongoose.Schema({
    title: String,
    timeLimit: Number,
    memLimit: Number,
    origin: String,
    content: String,
    inputDesc: String,
    outputDesc: String,
    sampleInput: String,
    sampleOutput: String,
    hint: String,
    test: []
});


ProblemScheme.statics.isProblemExist = function (id, callback) {
    this.countDocuments({_id: id}, callback);
};

mongoose.model('Problem', ProblemScheme);