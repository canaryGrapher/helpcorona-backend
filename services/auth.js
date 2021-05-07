const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //get token from the header
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorozition denied' });
    }
    try {
        const decode = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decode.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}