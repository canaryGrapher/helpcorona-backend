const MongoClient = require("mongodb").MongoClient;
const db = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        MongoClient.connect(
            db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
            (error, client) => {
                if (error) {
                    throw error;
                }
                coronaresourcesdatabase = client.db("coronaFight");
                collectionBeds = coronaresourcesdatabase.collection("dataBeds");
                collectionOxygen = coronaresourcesdatabase.collection("dataOxygen");
                collectionVentilator = coronaresourcesdatabase.collection("dataVentilator");
                collectionPlasma = coronaresourcesdatabase.collection("dataPlasma");
                collectionRequests = coronaresourcesdatabase.collection("dataRequests");
                collectionCounter = coronaresourcesdatabase.collection("counter");
            }
        )

        console.log('MongoDB is now connected');
    }
    catch (err) {
        console.log("There was an error connecting to the database.")
        console.error(err.message);
        // Exits the process with failure
        process.exit(1);
    }
};

module.exports = connectDB;