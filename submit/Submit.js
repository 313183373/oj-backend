const mongoose = require('mongoose');

const SubmitScheme = new mongoose.Schema({
    created: {type:Date, default: Date.now},
    author: mongoose.Schema.Types.ObjectId,
    problem: mongoose.Schema.Types.ObjectId,
    language: String,
    code: String,
    status: {type: String, default: 'Queuing'},
    time: {type:String, default: '--'},
    memory: {type:String, default: "--"},
    message: {type:String, default: ''}
});

mongoose.model("Submit",SubmitScheme);