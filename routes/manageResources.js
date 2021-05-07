const express = require('express');
const auth = require('../services/auth')
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;

// @route   POST /api/resources/new/
// @desc    Add new resource to the database
// @access  Private
router.post("/new", async (req, res) => {
    try {
        //making sure everything is there in the request
        if (!req.body.name || !req.body.phone || !req.body.state || !req.body.district || !req.body.info || !req.body.type) {
            res.status(400).json({ message: "Invalid 'type' for resource." })
        }
        //destructure the request body
        const { name, phone, state, district, info, type } = req.body
        //doing server tests
        if (type != 'bed' || type != 'icu' || type != 'oxygen' || type != 'plasma' || type != 'medicines' || type != 'ventilators' || type != 'ambulance' || type != 'others') {
            res.status(400).json({ message: "Invalid 'type' for resource." })
        }
        const inputObject = {
            name: name,
            phone: phone,
            state: state,
            district: district,
            info: info,
            type: type,
            creator: req.users.email
        }
        // input data into the database
        const result = await collectionResources.insertOne(inputObject)
        if (result.insertedCount === 1) {
            console.log("Inserted")
            res.status(200).json({ message: "Success" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   GET /api/resources/list
// @desc    Get all resource uploaded by a member
// @access  Private
router.get("/list", auth, async (req, res) => {
    try {
        const query = { creator: `${req.user.email}` }
        collectionResources.find(query).toArray(async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.status(200).send(result)
            } else {
                res.status(204).json({ message: "Nothing was found" })
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})

// @route   GET /api/resources/close
// @desc    Delete
// @access  Private
router.delete("/close/:resourceID", auth, async (req, res) => {
    try {
        const o_id = new ObjectID(req.params.resourceID);
        const query = { '_id': o_id }
        const resource = await collectionResources.deleteOne(query)
        if (resource.deletedCount === 1) {
            console.log("Deleted")
            res.status(200).json({message: "Deleted"})
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})


module.exports = router;