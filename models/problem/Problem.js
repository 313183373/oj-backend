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
    test: [],
    solution: String,
});


ProblemScheme.statics.isProblemExist = function (id) {
    return new Promise((resolve, reject) => {
        this.countDocuments({_id: id}, (err, count) => {
            if (err) {
                reject(err);
            }
            resolve(count > 0);
        });
    });
};

mongoose.model('Problem', ProblemScheme);