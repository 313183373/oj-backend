const express = require('express');
const morgan = require('morgan');
const app = express();
require('./db');
require('./models/problem/Problem');
require('./models/user/User');
require('./models/submit/Submit');

const AuthController = require('./middlewares/auth/AuthController');
const JudgeController = require('./middlewares/judge/JudgeController');
const ProblemController = require('./middlewares/problem/ProblemController');

const PORT = 5000;

app.use(morgan('dev'));
app.use('/api/auth', AuthController);
app.use(JudgeController);
app.use(ProblemController);

app.listen(PORT);
