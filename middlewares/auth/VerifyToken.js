const jwt = require('jsonwebtoken');
const {tokenHeader, secret} = require('../../config');

function verifyToken(required = true) {
    return function (req, res, next) {
        const token = req.headers[tokenHeader];
        if (!token) {
            if (required) {
                return res.status(401).send('No token provided.');
            } else {
                return next();
            }
        }
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(403).send('Authentication failed');
            }
            req.user = {id: decoded.id};
            req.decoded = decoded;
            next();
        })
    }
}

module.exports = verifyToken;