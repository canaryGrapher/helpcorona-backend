const express = require('express');
const auth = require('../services/auth')
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.post("/add", async (req, res) => {
    const o_id = new ObjectID("608955a7cbdef292b96f5111");
    const counterNumber = await collectionCounter.findOne({ _id: o_id })
    const value = parseInt(counterNumber.requestnumber) + parseInt(1)
    const updateNumber = await collectionCounter.updateOne({ _id: o_id }, { $set: { requestnumber: value } }, { upsert: true })
    try {
        if (updateNumber.modifiedCount === 1) {
            if (req.header('User-Agent') === "Typeform Webhooks") {
                let entryObject = {
                    entrynumber: counterNumber.requestnumber,
                    name: req.body.form_response.answers[0].text,
                    phone: req.body.form_response.answers[1].phone_number,
                    location: req.body.form_response.answers[2].text,
                    info: req.body.form_response.answers[3].text,
                    closed: false,
                    closedby: null
                }
                const result = await collectionRequests.insertOne(entryObject)
                if (result.insertedCount === 1) {
                    res.status(200).send();
                }
                else {
                    res.send("Error Inserting")
                }
            }
        }
        else {
            res.send("Error incrementing")
        }
    } catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.get("/view/:apikey", auth, async (req, res) => {
    try {
        const query = { closed: false };
        collectionRequests.find(query).toArray(async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send(result)
            }
            else {
                res.send("Error")
            }
        })
    }
    catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.get('/public/view', async (req, res) => {
    try {
        const query = { closed: false };
        const recievedData = await collectionRequests.find(query).toArray();
        const returnArray = []
        recievedData.forEach((item) => {
            if(!item.closed) {
                const structure = {
                    id: item.entrynumber,
                    location: item.location,
                    info: item.info
                }
                returnArray.push(structure)
            }
        })
        console.log("Sent")
        res.send(returnArray)
    }
    catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.put("/close/:apikey/:requestID", auth, async (req, res) => {
    try {
        const o_id = new ObjectID(req.params.requestID);
        const updateNumber = await collectionRequests.updateOne({ _id: o_id }, {
            $set: {

                closed: true,
                closedby: `${req.params.apikey}`
            }
        }, { upsert: false })
        if (updateNumber.modifiedCount === 1) {
            res.send("Updated")
        } else {
            res.send("Already updated")
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

module.exports = router;