const API_KEYS = require('./apikeys');

module.exports = function (req, res, next) {
    //get token from the header
    if (!req.params.apikey) {
        return res.status(401).json({ msg: 'No APIkeys, authorozition denied' });
    }
    try {
        let selectedUser
        const fetchedObject = API_KEYS.api_keys
        let volunteerDetails = fetchedObject.forEach(user => {
            if (user.keyID == req.params.apikey) {
                selectedUser = user
                return user
            }
        });
        //clearing the memory after use
        volunteerDetails = null
        if (selectedUser) {
            console.log("Authenticated")
            next();
        }
        else {
            console.log("Not Authenticated")
            res.status(401).json({ msg: 'API is not valid' });
        }
    } catch (err) {
        res.status(401).json({ msg: 'API is not valid' });
    }
};
