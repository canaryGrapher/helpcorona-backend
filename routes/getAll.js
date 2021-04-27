const express = require('express');
const router = express.Router();

router.get("/:state", async (req, res) => {
    try {
        let combinedArray = []
        const stateQuery = req.params.state.toLowerCase().replace(/\s/g, '');
        const query = { state: `${stateQuery}` }
        collectionBeds.find(query).toArray(async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                if (result.length > 0) {
                    await result.map(item => {
                        combinedArray.push(item)
                    })
                }
            }
            collectionOxygen.find(query).toArray(async (err, result1) => {
                if (err) throw err;
                if (result1.length > 0) {
                    await result1.map(item1 => {
                        combinedArray.push(item1)
                    })
                }
                collectionVentilator.find(query).toArray(async (err, result2) => {
                    if (err) throw err;
                    if (result2.length > 0) {
                        await result2.map(item2 => {
                            combinedArray.push(item2)
                        })
                    }
                    collectionPlasma.find(query).toArray(async (err, result3) => {
                        if (err) throw err;
                        if (result3.length > 0) {
                            await result3.map(item3 => {
                                combinedArray.push(item3)
                            })
                        }
                        const sendingObject = combinedArray.length > 0 ? combinedArray : "Error"
                        res.send(sendingObject)
                    })
                })
            })
        })

    } catch (error) {
        res.send(error)
    }
})


module.exports = router;