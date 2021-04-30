const MongoClient = require("mongodb").MongoClient;
const db = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        MongoClient.connect(
            db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
            async (error, client) => {
                if (error) {
                    throw error;
                }
                coronaresourcesdatabase = client.db("coronaFight");
                collectionBeds = await coronaresourcesdatabase.collection("dataBeds");
                collectionOxygen = await coronaresourcesdatabase.collection("dataOxygen");
                collectionVentilator = await coronaresourcesdatabase.collection("dataVentilator");
                collectionPlasma = await coronaresourcesdatabase.collection("dataPlasma");
                collectionRequests = await coronaresourcesdatabase.collection("dataRequests");
                collectionCounter = await coronaresourcesdatabase.collection("counter");
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