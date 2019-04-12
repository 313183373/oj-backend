const router = require('express').Router();
const mongoose = require('mongoose');
const verifyToken = require('../auth/VerifyToken');

const Submit = mongoose.model('Submit');

router.get('/:submitId', verifyToken(true), async (req, res) => {
  const submitId = req.params.submitId;
  try {
    const submit = await Submit.findSubmitById(submitId);
    res.json(submit);
  } catch (e) {
    res.status(500).send('Server error');
  }
});


module.exports = router;