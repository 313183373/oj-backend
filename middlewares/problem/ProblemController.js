const router = require('express').Router();
const mongoose = require('mongoose');
const verifyToken = require('../auth/VerifyToken');
const {supportLanguage} = require('../../config');
const judgeEmitter = require('./JudgeEmitter');
const express = require('express');

const Problem = mongoose.model('Problem');


router.use(express.json());

router.get('/', verifyToken(false), async (req, res) => {
  const page = req.query.page ? +req.query.page : 1;
  const problemPerPage = req.query.size ? +req.query.size : 10;
  if (page <= 0 || problemPerPage <= 0) {
    return res.status(400).send("Invalid parameters");
  }
  const start = (page - 1) * problemPerPage;
  const problems = await Problem.find({}, {
    title: 1,
    submitCount: 1,
    acceptCount: 1
  }).skip(start).limit(problemPerPage).exec();
  const totalProblemNumber = await Problem.estimatedDocumentCount();
  res.json({problems: problems, totalProblemNumber});
});

router.get('/:problemId', verifyToken(false), async (req, res) => {
  const problemId = req.params.problemId;
  try {
    const problem = await Problem.findById(problemId, {solution: 0, test: 0}).exec();
    res.json(problem);
  } catch (e) {
    return res.status(404).send("Problem not found");
  }
});

router.post('/:problemId', verifyToken(true), checkParams, (req, res) => {
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
    });
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
    return res.status(501).send("Not supported language");
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
