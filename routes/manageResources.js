const express = require('express');
const API_KEYS = require('../services/apikeys');
const auth = require('../services/auth')
const { route } = require('./getVentilator');
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const databaseArray = ["collectionBeds", "collectionOxygen", "collectionVentilator", "collectionPlasma"]

router.post("/new/:apikey", auth, async (req, res) => {
    try {
        const { name, phone, state, district, info, type } = req.body
        const inputObject = {
            name: name,
            phone: phone,
            state: state,
            district: district,
            info: info,
            type: type,
            creator: req.params.apikey
        }
        switch (req.body.type) {
            case "beds":
                const result1 = await collectionBeds.insertOne(inputObject)
                if (result1.insertedCount === 1) {
                    console.log("Inserted")
                    res.send("Inserted")
                }
                break;
            case "ventilators":
                const result2 = await collectionVentilator.insertOne(inputObject)
                if (result2.insertedCount === 1) {
                    console.log("Inserted")
                    res.send("Inserted")
                }
                break;
            case "oxygen":
                const result3 = await collectionOxygen.insertOne(inputObject)
                if (result3.insertedCount === 1) {
                    console.log("Inserted")
                    res.send("Inserted")
                }
                break;
            case "plasma":
                const result4 = await collectionPlasma.insertOne(inputObject)
                if (result4.insertedCount === 1) {
                    console.log("Inserted")
                    res.send("Inserted")
                }
                break;
            default:
                res.send("Insert Error")
        }
    } catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.get("/details/:apikey", auth, async (req, res) => {
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
    res.send(selectedUser)
})

router.get("/list/:apikey", auth, async (req, res) => {
    try {
        let combinedArray = []
        const query = { creator: `${req.params.apikey}` }
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
        console.error(error)
        res.send("Error")
    }
})

router.patch("/close/:apikey/:type/:resourceID", auth, async (req, res) => {
    try {
        const o_id = new ObjectID(req.params.resourceID);
        const query = { '_id': o_id }
        switch (req.params.type) {
            case "beds":
                const result1 = await collectionBeds.deleteOne(query)
                if (result1.deletedCount === 1) {
                    res.send("Deleted")
                }
                break;
            case "ventilators":
                const result2 = await collectionVentilator.deleteOne(query)
                if (result1.deletedCount === 1) {
                    res.send("Deleted")
                }
                break;
            case "oxygen":
                const result3 = await collectionOxygen.deleteOne(query)
                if (result1.deletedCount === 1) {
                    res.send("Deleted")
                }
                break;
            case "plasma":
                const result4 = await collectionPlasma.deleteOne(query)
                if (result1.deletedCount === 1) {
                    res.send("Deleted")
                }
                break;
            default:
                res.send("Delete Error")
        }
    } catch (error) {
        console.error(error)
        res.send("Error")
    }
})


module.exports = router;