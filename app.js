const express = require('express');
const morgan = require('morgan');
const app = express();
require('./db');
require('./models/problem/Problem');
require('./models/user/User');
require('./models/submit/Submit');

const UserController = require('./middlewares/user/UserController');
const ProblemController = require('./middlewares/problem/ProblemController');

const PORT = 5000;

app.use(morgan('dev'));
app.use('/user', UserController);
app.use('/problems', ProblemController);

app.listen(PORT);
