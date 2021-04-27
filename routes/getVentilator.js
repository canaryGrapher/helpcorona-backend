const express = require('express');
const router = express.Router();

router.get("/:state", async (req, res) => {
    try {
        const stateQuery = req.params.state.toLowerCase().replace(/\s/g, '');
        console.log(stateQuery)
        const query = { state: `${stateQuery}` }
        console.log(query)
        collectionVentilator.find(query).toArray((err, result) => {
            if (err) throw err;
            if(result.length > 0) {
                res.send(result)
            }
            else {
                res.send("Error")
            }
        })
    } catch (error) {
        res.send("Error")
    }
})


module.exports = router;