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
  solution: [],
  submits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submit'
  }]
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

ProblemScheme.statics.findAllProblemsWithStatus = async function (start, size, userId) {
  const result = userId ? await this.find({}).populate({
    path: 'submits',
    match: {author: userId}
  }).skip(start).limit(size).lean().select('title submitCount acceptCount submits') : await this.find({}).skip(start).limit(size).lean().select('title submitCount acceptCount');
  return result.map(problem => {
    const isSubmitted = problem.submits ? problem.submits.length !== 0 : false;
    const isAccepted = problem.submits ? problem.submits.some(submit => submit.status === 'AC') : false;
    const status = isAccepted ? 'accepted' : isSubmitted ? 'submitted' : 'none';
    return {
      title: problem.title,
      submitCount: problem.submitCount,
      acceptCount: problem.acceptCount,
      status,
      _id: problem._id,
    };
  });
};

mongoose.model('Problem', ProblemScheme);