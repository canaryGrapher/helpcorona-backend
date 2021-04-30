const express = require('express');
const auth = require('../services/auth')
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const { lookup } = require('geoip-lite')
var axios = require("axios").default;
const RequestIp = require('@supercharge/request-ip')

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
                    closedby: null,
                    commentcount: 0,
                    comments: [],
                    date: new Date()
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
            if (!item.closed) {
                const structure = {
                    id: item.entrynumber,
                    location: item.location,
                    info: item.info,
                    commentcount: item.commentcount
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

router.get('/public/thread/:threadID', async (req, res) => {
    try {
        const o_id = new ObjectID("608955a7cbdef292b96f5111");
        //check if the document exists in the database
        const counterNumber = await collectionCounter.findOne({ _id: o_id })
        if (req.params.threadID < counterNumber.requestnumber) {
            const threadDetails = await collectionRequests.findOne({ entrynumber: parseInt(req.params.threadID) });
            const returnObject = {
                id: threadDetails.entrynumber,
                location: threadDetails.location,
                info: threadDetails.info,
                comments: threadDetails.comments,
                closed: threadDetails.closed,
                commentcount: threadDetails.commentcount
            }
            res.send(returnObject)
        } else {
            res.send("Error")
        }

    } catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.post('/public/thread/comment/:threadID', async (req, res) => {
    try {
        const ip = RequestIp.getClientIp(req)
        // using IP Geo Location App
        const response = await axios.get("https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/", {
            params: {
                ip: `{ip}`
            },
            headers: {
                'x-rapidapi-key': '35d9997087msh39d2940debc10f8p11d939jsn834547a38d19',
                'x-rapidapi-host': 'ip-geolocation-ipwhois-io.p.rapidapi.com'
            }
        })

        console.log(response.data)
        const commentSender = {
            headers: JSON.stringify(req.headers),
            ip: req.socket.remoteAddress,
            iplookup: lookup(ip),
            useragent: req.get('User-Agent'),
            advancedLookup: response.data
        }
        console.log(commentSender)
        console.log(lookup(req.ip))
        const o_id = new ObjectID("608955a7cbdef292b96f5111");
        //check if the document exists in the database
        const counterNumber = await collectionCounter.findOne({ _id: o_id })
        if (parseInt(req.params.threadID) < counterNumber.requestnumber) {
            const threadDetails = await collectionRequests.findOne({ entrynumber: parseInt(req.params.threadID) });
            const entryObject = {
                commentid: `comment_${threadDetails.commentcount + 1}_${threadDetails._id}`,
                date: new Date(),
                comment: req.body.comment,
                likes: 0,
                dislikes: 0,
                creatordetails: commentSender
            }
            threadDetails.comments.unshift(entryObject)
            threadDetails.commentcount++;
            const updateThreadProcess = await collectionRequests.replaceOne({ entrynumber: parseInt(req.params.threadID) }, threadDetails, { upsert: false })
            res.status(200).send("Post Added")
        } else {
            res.send("Error")
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.put('/public/thread/like/:threadID/:commentid', async (req, res) => {
    try {
        const o_id = new ObjectID("608955a7cbdef292b96f5111");
        //check if the document exists in the database
        const counterNumber = await collectionCounter.findOne({ _id: o_id })
        if (parseInt(req.params.threadID) < counterNumber.requestnumber) {
            const threadDetails = await collectionRequests.findOne({ entrynumber: parseInt(req.params.threadID) });
            const newThreadComments = threadDetails.comments.map((item) => {
                if (item.commentid == req.params.commentid) {
                    item.likes += 1
                    return item
                } else {
                    return item
                }
            })
            threadDetails.comments = newThreadComments
            const updateThreadProcess = await collectionRequests.replaceOne({ entrynumber: parseInt(req.params.threadID) }, threadDetails, { upsert: false })
            if (updateThreadProcess.modifiedCount === 1) {
                res.send("Updated")
            } else {
                res.send("Error")
            }
        } else {
            res.status(404).send("Thread does not exist")
        }
    } catch (error) {
        console.log(error)
        res.send("Error")
    }
})

router.put('/public/thread/dislike/:threadID/:commentid', async (req, res) => {
    try {
        const o_id = new ObjectID("608955a7cbdef292b96f5111");
        //check if the document exists in the database
        const counterNumber = await collectionCounter.findOne({ _id: o_id })
        if (parseInt(req.params.threadID) < counterNumber.requestnumber) {
            const threadDetails = await collectionRequests.findOne({ entrynumber: parseInt(req.params.threadID) });
            const newThreadComments = threadDetails.comments.map((item) => {
                if (item.commentid == req.params.commentid) {
                    item.dislikes += 1
                    return item
                } else {
                    return item
                }
            })
            threadDetails.comments = newThreadComments
            const updateThreadProcess = await collectionRequests.replaceOne({ entrynumber: parseInt(req.params.threadID) }, threadDetails, { upsert: false })
            if (updateThreadProcess.modifiedCount === 1) {
                res.send("Updated")
            } else {
                res.send("Error")
            }
        } else {
            res.status(404).send("Thread does not exist")
        }
    } catch (error) {
        console.log(error)
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