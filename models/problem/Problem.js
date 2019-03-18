const mongoose = require('mongoose');

const ProblemScheme = new mongoose.Schema({
    title: String,
    timeLimit: Number,
    memLimit: Number,
    origin: String,
    content: String,
    submitCount: Number,
    acceptCount: Number,
    inputDesc: String,
    outputDesc: String,
    sampleInput: String,
    sampleOutput: String,
    hint: String,
    test: []
});


ProblemScheme.statics.isProblemExist = function (id, callback) {
    this.countDocuments({_id: id}, (err, count) => callback(err, count > 0));
};

mongoose.model('Problem', ProblemScheme);