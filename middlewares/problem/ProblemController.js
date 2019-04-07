const router = require('express').Router();
const mongoose = require('mongoose');
const verifyToken = require('../auth/VerifyToken');
const {supportLanguage} = require('../../config');
const judgeEmitter = require('./JudgeEmitter');
const express = require('express');

const Problem = mongoose.model('Problem');
const Submit = mongoose.model('Submit');


router.use(express.json());

router.get('/', verifyToken(false), async (req, res) => {
  const page = req.query.page ? +req.query.page : 1;
  const size = req.query.size ? +req.query.size : 10;
  if (page <= 0 || size <= 0) {
    return res.status(400).send("Invalid parameters");
  }
  const start = (page - 1) * size;
  const problems = await Problem.findAllProblemsWithStatus(start, size, req.user && req.user.id);
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

router.get('/:problemId/submits', verifyToken(true), async (req, res) => {
  const problemId = req.params.problemId;
  try {
    const problem = await Submit.findSubmitsByProblemIdOrderByCreatedDesc(problemId, req.user && req.user.id);
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
    Problem.updateOne({_id: problem}, {$push: {submits: submit._id}}, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      judgeEmitter.emit('startJudge', submit._id, problem);
      res.json({
        message: "Submit success",
        submitId: submit._id,
      });
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
