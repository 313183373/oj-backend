require('dotenv').config();

module.exports = {
    secret: process.env.SECRET,
    tokenHeader: 'x-access-token',
    supportLanguage: ['c', 'c++'],
};