const EventEmitter = require('events');
const childProcess = require('child_process');
const mongoose = require('mongoose');

const Submit = mongoose.model("Submit");
const Problem = mongoose.model('Problem');
const {socketEmitter} = require('../../socket/socketHandler');

class JudgeEmitter extends EventEmitter {
}

const judgeEmitter = new JudgeEmitter();
judgeEmitter.on('startJudge', (submitID, problemID) => {
  const command = `docker run --cap-add=SYS_PTRACE --net=mynet --rm -w /judge 313183373/oj ./judge ${submitID} ${problemID}`;
  console.log(`${submitID} ${problemID}`);
  childProcess.exec(command, async function (err, stdout, stderr) {
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
      console.log(submit);
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
