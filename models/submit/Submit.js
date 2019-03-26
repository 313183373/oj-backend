const mongoose = require('mongoose');

const SubmitScheme = new mongoose.Schema({
  created: {type: Date, default: Date.now},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  problem: {type: mongoose.Schema.Types.ObjectId, ref: 'Problem'},
  language: String,
  code: String,
  status: {type: String, default: 'Queuing'},
  time: {type: String, default: '--'},
  memory: {type: String, default: "--"},
  message: {type: String, default: ''}
});

mongoose.model("Submit", SubmitScheme);