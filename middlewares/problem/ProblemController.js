const router = require('express').Router();
const mongoose = require('mongoose');

const Problem = mongoose.model('Problem');

router.get('/problems', async (req, res) => {
    const problems = await Problem.find({}, {title: 1}).exec();
    console.log(problems);
    res.json({
        status: "success",
        problems,
    });
});

module.exports = router;
