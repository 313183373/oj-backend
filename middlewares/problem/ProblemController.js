const router = require('express').Router();
const mongoose = require('mongoose');

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

module.exports = router;
