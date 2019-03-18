const EventEmitter = require('events');
const childProcess = require('child_process');
const mongoose = require('mongoose');

const Submit = mongoose.model("Submit");

class JudgeEmitter extends EventEmitter {
}

const judgeEmitter = new JudgeEmitter();
judgeEmitter.on('startJudge', (submitID, problemID) => {
    const command = `docker run --cap-add=SYS_PTRACE --net=mynet --rm -w /judge 313183373/oj ./judge ${submitID} ${problemID}`;
    console.log(`${submitID} ${problemID}`);
    childProcess.exec(command, function (err, stdout, stderr) {
        if (err) {
            console.log("err:");
            console.log(err.code, err.signal);
            Submit.updateOne({_id: submitID}, {status: "system error", message: err.message}, function (dbErr, res) {
                if (dbErr) {
                    throw dbErr;
                }
                if(res.modifiedCount) {
                    throw err;
                }
            });
        }
        if (stderr) {
            console.log('stderr:');
            console.error(stderr);
        }
        // if(stdout) {
        //     console.log(stdout);
        // }
    });
});

module.exports = judgeEmitter;
