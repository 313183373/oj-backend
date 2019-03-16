const router = require('express').Router();
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const async = require('async');
const exec = require('util').promisify(childProcess.exec);
const judgeEmitter = require('./JudgeEmitter');

const Problem = mongoose.model('Problem');
const Submit = mongoose.model("Submit");

const COMPILE_TIME_LIMIT = 5000; //ms

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/judge', async (req, res) => {
    const {language, code, problem, author} = req.body;
    if (!language || !code || !problem || !author) {
        return res.json({
            status: "error",
            error: 'params error!'
        });
    }
    switch (language) {
        case "c++" : {
            Problem.isProblemExist(problem, (err, count) => {
                if (err) {
                    return res.json({status: "error", error: "server error!"});
                }
                if (count) {
                    Submit.create({author, problem, language, code}, (err, submit) => {
                        if (err) {
                            return res.json({status: "error", error: "server error!"});
                        }
                        const submitID = submit._id;
                        judgeEmitter.emit('startJudge', submitID, problem);
                        res.json({status: "success", message: "submit success"});
                    });
                } else {
                    return res.json({status: "error", error: "problem is not exists"});
                }
            });
            break;
        }
        // case 'c': {
        //     await fs.outputFile('code.c', code);
        //     try {
        //         const {stderr} = await exec('gcc code.c -o code.out -O2', {timeout: COMPILE_TIME_LIMIT});
        //         if (stderr) {
        //             console.log(1);
        //             console.error(stderr);
        //             return res.json('compile error');
        //         }
        //     } catch (e) {
        //         console.log(e.name, e.message, e.signal, e.code);
        //         // 编译错误
        //         console.log('compile error');
        //         // console.error(e);
        //         return res.json({error: 'compile error'});
        //     }
        //     const result = {
        //         result: 'AC',
        //         testList: [],
        //         maxTime: 0,
        //     };
        //     Problem.findById(problem).then(async problem => {
        //         if (!problem) {
        //             return res.json({
        //                 error: 'invalid problem id',
        //             })
        //         }
        //         // const obs = new PerformanceObserver((list) => {
        //         //     console.log(list.getEntries()[0]);
        //         //     // performance.clearMarks();
        //         // });
        //
        //         // obs.observe({entryTypes: ['measure']});
        //         async.eachSeries(problem.test, (t, callback) => {
        //             // performance.mark(`${index}-start`);
        //             const startTime = new Date();
        //             const runProcess = childProcess.exec('./code.out', {timeout: problem.timeLimit}, (err, stdout, stderr) => {
        //                 // performance.mark(`${index}-end`);
        //                 // performance.measure(`${index}-duration`, `${index}-start`, `${index}-end`);
        //                 const duration = new Date() - startTime;
        //                 const test = {
        //                     input: t.input,
        //                 };
        //                 if (err) {
        //                     if (err.signal === 'SIGTERM') {
        //                         result.result = 'TLE';
        //                         test.isTLE = true;
        //                         test.duration = duration;
        //                         result.testList.push(test);
        //                         console.log(`输入${t.input} 超时`);
        //                         return callback('TLE');
        //                     }
        //                     // 不知道除了SIGTERM信号之外，还会触发什么信号
        //                     return console.error(err.name, err.message, err.code, err.signal);
        //                 }
        //                 if (stderr) {
        //                     // 目前还没有运行到这个分支中
        //                     return callback('run error');
        //                 }
        //                 console.log(`输入:${t.input},期望输出:${t.output},实际输出:${stdout},耗时:${duration}`);
        //                 test.output = stdout;
        //                 test.isCorrect = stdout === t.output;
        //                 test.duration = duration;
        //                 result.maxTime = result.maxTime < duration ? duration : result.maxTime;
        //                 result.testList.push(test);
        //                 return callback();
        //             });
        //             // set stdin
        //             runProcess.stdin.write(t.input);
        //             runProcess.stdin.end();
        //         }, (message) => {
        //             // obs.disconnect();
        //             // performance.clearMarks();
        //             console.log('all test complete');
        //             res.json(result);
        //         });
        //     }).catch(e => {
        //         if (e.name === 'CastError') {
        //             return res.json({error: 'invalid problem id'});
        //         }
        //         return res.status(500).json({error: 'server error'});
        //     });
        //
        //     break;
        // }
        // case 'js': {
        //     Problem.findById(problem).then(problem => {
        //         if (!problem) {
        //             return res.json({
        //                 error: "invalid problem id",
        //             })
        //         }
        //         const sandbox = new Sandbox();
        //         async.eachSeries(problem.test, (t, callback) => {
        //             sandbox
        //         })
        //     })
        // }
    }
});

module.exports = router;