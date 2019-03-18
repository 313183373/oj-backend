const router = require('express').Router();
const mongoose = require('mongoose');
const verifyToken = require('../auth/VerifyToken');
const {supportLanguage} = require('../../config');
const judgeEmitter = require('./JudgeEmitter');

const Problem = mongoose.model('Problem');

const ProblemPerPage = 10;

router.get('/problems', async (req, res) => {
    const page = req.query.page ? +req.query.page : 1;
    const start = (page - 1) * ProblemPerPage;
    const problems = await Problem.find({}, {
        title: 1,
        submitCount: 1,
        acceptCount: 1
    }).skip(start).limit(ProblemPerPage).exec();
    res.json({
        problems,
    });
});

router.get('/problems/:problemId', async (req, res) => {
    const problemId = req.params.problemId;
    try {
        const problem = await Problem.findById(problemId).exec();
        res.json(problem);
    } catch (e) {
        return res.status(404).send("Problem not found");
    }
});

router.post('/problems/:problemId', verifyToken(false), checkParams, (req, res) => {
    const {language, code} = req.body;
    const problem = req.params.problemId;
    const userId = req.user && req.user.id;
    const Submit = mongoose.model("Submit");
    Submit.create({author: userId, problem, language, code}, (err, submit) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }
        judgeEmitter.emit('startJudge', submit._id, problem);
        res.json({
            message: "Submit success",
        })
    });
});

function checkParams(req, res, next) {
    const {language, code} = req.body;
    const problem = req.params.problemId;
    const userId = req.user && req.user.id;
    if (!language || !code || !problem || !userId) {
        return res.status(400).send("Invalid params");
    }
    if (!supportLanguage.includes(language)) {
        return res.status(501).send("Not support language");
    }
    Problem.isProblemExist(problem, (err, isExist) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (isExist) {
            next();
        } else {
            return res.status(404).send('Problem not found');
        }
    })
}

module.exports = router;
