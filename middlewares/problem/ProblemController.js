const router = require('express').Router();
const mongoose = require('mongoose');
const verifyToken = require('../auth/VerifyToken');
const {supportLanguage} = require('../../config');
const judgeEmitter = require('./JudgeEmitter');
const express = require('express');

const Problem = mongoose.model('Problem');

const ProblemPerPage = 10;

router.use(express.json());

router.get('/', async (req, res) => {
    const page = req.query.page ? +req.query.page : 1;
    const start = (page - 1) * ProblemPerPage;
    const problems = await Problem.find({}, {
        title: 1,
        submitCount: 1,
        acceptCount: 1
    }).skip(start).limit(ProblemPerPage).exec();
    res.json(problems);
});

router.get('/:problemId', async (req, res) => {
    const problemId = req.params.problemId;
    try {
        const problem = await Problem.findById(problemId).exec();
        res.json(problem);
    } catch (e) {
        return res.status(404).send("Problem not found");
    }
});

router.post('/:problemId', verifyToken(false), checkParams, (req, res) => {
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

async function checkParams(req, res, next) {
    const {language, code} = req.body;
    const problem = req.params.problemId;
    const userId = req.user && req.user.id;
    if (!language || !code || !problem || !userId) {
        return res.status(400).send("Invalid parameters");
    }
    if (!supportLanguage.includes(language)) {
        return res.status(501).send("Not support language");
    }
    try {
        const isExist = await Problem.isProblemExist(problem);
        if (!isExist) {
            return res.status(404).send("Problem not found");
        }
        next();
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error");
    }
}

module.exports = router;
