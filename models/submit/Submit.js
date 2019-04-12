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

SubmitScheme.statics.findSubmitsByProblemIdOrderByCreatedDesc = async function (problemId, userId) {
  return await this.find({
    problem: problemId,
    author: userId
  }).sort({created: 'desc'}).select('created status time memory language').limit(20).lean();
};

SubmitScheme.statics.findSubmitById = async function (submitId) {
  return await this.findById(submitId);
};

mongoose.model("Submit", SubmitScheme);