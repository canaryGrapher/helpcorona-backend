const express = require('express');
const API_KEYS = require('../services/apikeys')
const router = express.Router();

router.post("/new/:apikey", async (req, res) => {
    try {
        console.log(req.params.apikey)
    } catch (error) {
        res.send("Error")
    }
})

router.get("/list/:apikey", async (req, res) => {
    try {
        let selectedUser
        const fetchedObject = API_KEYS.api_keys
        const volunteerDetails = fetchedObject.forEach(user => {
            if(user.keyID == req.params.apikey) {
                selectedUser = user
                return user
            }
        });
        //clearing the memory after use is foound
        volunteerDetails = null
        console.log(selectedUser.firstname)
        // let combinedArray = []
        // const query = { creator: `${stateQuery}` }
        // collectionBeds.find(query).toArray(async (err, result) => {
        //     if (err) throw err;
        //     if (result.length > 0) {
        //         if (result.length > 0) {
        //             await result.map(item => {
        //                 combinedArray.push(item)
        //             })
        //         }
        //     }
        //     collectionOxygen.find(query).toArray(async (err, result1) => {
        //         if (err) throw err;
        //         if (result1.length > 0) {
        //             await result1.map(item1 => {
        //                 combinedArray.push(item1)
        //             })
        //         }
        //         collectionVentilator.find(query).toArray(async (err, result2) => {
        //             if (err) throw err;
        //             if (result2.length > 0) {
        //                 await result2.map(item2 => {
        //                     combinedArray.push(item2)
        //                 })
        //             }
        //             collectionPlasma.find(query).toArray(async (err, result3) => {
        //                 if (err) throw err;
        //                 if (result3.length > 0) {
        //                     await result3.map(item3 => {
        //                         combinedArray.push(item3)
        //                     })
        //                 }
        //                 const sendingObject = combinedArray.length > 0 ? combinedArray : "Error"
        //                 res.send(sendingObject)
        //             })
        //         })
        //     })
        // })
    } catch (error) {
        console.error(error)
        res.send("Error")
    }
})

router.patch("/close/:apikey/:reqID", async (req, res) => {
    try {

    } catch (error) {
        res.send("Error")
    }
})


module.exports = router;