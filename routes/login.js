const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../services/auth')

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        //see if the user exists
        let user = await collectionUsers.findOne({ email: email });
        console.log(user)
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid Credentials' }]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid Credentials' }]
            });
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                email: user.email,
                name: user.name,
                phone: user.phone
            }
        };
        //token expires after 10 days
        jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { expiresIn: 864000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

        // res.send('User Route');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
);

// @route   GET /api/resources/details/
// @desc    Get logged in user details
// @access  Private
router.get("/details", auth, async (req, res) => {
    res.send(req.user)
})

module.exports = router;