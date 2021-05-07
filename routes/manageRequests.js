const express = require('express');
const auth = require('../services/auth')
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const { lookup } = require('geoip-lite')
var axios = require("axios").default;
const requestIp = require('request-ip');

// @route   POST /api/resources/list
// @desc    Upload a new request through Typeform
// @access  Public - through Typeform
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
                    res.status(200).send(result);
                }
                else {
                    res.status(304).json({ message: "Error Inserting" })
                }
            }
        }
        else {
            res.status(304).json({ message: "Error incrementing" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   GET /api/resources/view
// @desc    Get all open requests with all details
// @access  Private
router.get("/view", auth, async (req, res) => {
    try {
        const query = { closed: false };
        collectionRequests.find(query).toArray(async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.status(200).send(result)
            }
            else {
                res.status(204).json({ message: "No open requests" })
            }
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   Get /api/resources/public/view
// @desc    Get all open requests
// @access  Public
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
                    commentcount: item.commentcount,
                    timestamp: item.date
                }
                returnArray.push(structure)
            }
        })
        res.status(200).send(returnArray)
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   Get /api/resources/thread/:threadID
// @desc    Get a particular request thread page
// @access  Public
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
                commentcount: threadDetails.commentcount,
                timestamp: threadDetails.date
            }
            res.status(200).send(returnObject)
        } else {
            res.status(304).json({ message: "Error" })
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   POST /api/resources/thread/comment/:threadID
// @desc    Add a comment to a particular request thread
// @access  Public
router.post('/public/thread/comment/:threadID', async (req, res) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        // using IP Geo Location App
        const advancedLookupIP = clientIp.replace(/^.*:/, '')
        const response = await axios.get("https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/", {
            params: {
                ip: `${advancedLookupIP}`
            },
            headers: {
                'x-rapidapi-key': `${process.env.API_KEYS}`,
                'x-rapidapi-host': 'ip-geolocation-ipwhois-io.p.rapidapi.com'
            }
        })

        const commentSender = {
            headers: JSON.stringify(req.headers),
            ip: req.socket.remoteAddress,
            iplookup: lookup(advancedLookupIP),
            useragent: req.get('User-Agent'),
            advancedLookup: response.data
        }
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
            res.status(304).send({ message: "Error" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   PUT /api/resources/thread/like/:threadID/:commentid
// @desc    Add like to a particular comment
// @access  Public
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
                res.status(200).json({ message: "Updated" })
            } else {
                res.status(304).json({ message: "Error" })
            }
        } else {
            res.status(404).send("Thread does not exist")
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   PUT /api/resources/thread/dislike/:threadID/:commentid
// @desc    Add dislike to a particular comment
// @access  Public
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
                res.status(200).json({ message: "Updated" })
            } else {
                res.status(304).json({ message: "Error" })
            }
        } else {
            res.status(404).send("Thread does not exist")
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   PUT /api/resources/close/:requestID
// @desc    Close an open request thread
// @access  Private
router.put("/close/:requestID", auth, async (req, res) => {
    try {
        const o_id = new ObjectID(req.params.requestID);
        const updateNumber = await collectionRequests.updateOne({ _id: o_id }, {
            $set: {
                closed: true,
                closedby: `${req.user.email}`
            }
        }, { upsert: false })
        if (updateNumber.modifiedCount === 1) {
            res.status(200).json({ message: "Updated" })
        } else {
            res.status(304).json({ message: "Already updated" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router;