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
                collectionRequests = await coronaresourcesdatabase.collection("requests");
                collectionResources = await coronaresourcesdatabase.collection("resources")
                collectionUsers = await coronaresourcesdatabase.collection("volunteers")
                collectionCounter = await coronaresourcesdatabase.collection("counter")
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