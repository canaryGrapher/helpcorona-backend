const express = require('express');
const router = express.Router();

// @route   GET /api/get/resources?state=State%20Name&district=District%20Name
// @desc    Get every resource of a state
// @access  Public
router.get("/resources", async (req, res) => {
    try {
        const stateQuery = req.query.state.toLowerCase().replace(/\s/g, '');
        console.log(stateQuery)
        const districtQuery = req.query.district
        const query = { state: `${stateQuery}`, district: `${districtQuery}`  }
        console.log(query)
        collectionResources.find(query).toArray((err, result) => {
            if (err) throw err;
            if(result.length > 0) {
                res.status(200).send(result)
            }
            else {
                res.status(204).json({ message: "No resources found" })
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})


module.exports = router;