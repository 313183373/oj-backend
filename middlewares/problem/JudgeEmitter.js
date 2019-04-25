const EventEmitter = require('events');
const childProcess = require('child_process');
const mongoose = require('mongoose');

const Submit = mongoose.model("Submit");
const Problem = mongoose.model('Problem');
const {socketEmitter} = require('../../socket/socketHandler');

const isProduction = process.env.NODE_ENV === 'production';

class JudgeEmitter extends EventEmitter {
}

const judgeEmitter = new JudgeEmitter();
judgeEmitter.on('startJudge', (submitID, problemID) => {
  const command = isProduction ? `docker run --cap-add=SYS_PTRACE --net=oj_ojNetwork --rm -w /judge 313183373/oj-judge ./judge ${submitID} ${problemID}` : `docker run --cap-add=SYS_PTRACE --net=oj_ojNetwork --rm -w /judge 313183373/oj-judge:local ./judge ${submitID} ${problemID}`;
  console.log(`${submitID} ${problemID}`);
  const options = {maxBuffer: 1024 * 1024 * 256};
  childProcess.exec(command, options, async function (err, stdout, stderr) {
    if (err) {
      console.error(err);
      console.log(err.code, err.signal);
      Submit.updateOne({_id: submitID}, {status: "system error", message: err.message}, function (dbErr, res) {
        if (dbErr) {
          throw dbErr;
        }
        if (res.modifiedCount) {
          throw err;
        }
      });
    }
    if (stderr) {
      console.log('stderr:');
      console.error(stderr);
    }
    try {
      const submit = await Submit.findOne({_id: submitID});
      socketEmitter.emit('judgeEnd', submit);
      if (submit.status === 'AC') {
        await Problem.increaseAcceptCountById(submit.problem);
      }
    } catch (e) {
      console.error(e);
    }
    // if(stdout) {
    //     console.log(stdout);
    // }
  });
});

module.exports = judgeEmitter;
