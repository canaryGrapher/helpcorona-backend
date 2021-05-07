const express = require('express');
//making use of environment variables
const env = require('dotenv').config();
//importing modules
const cors = require('cors')
const connectDB = require('./services/mongodb-connect');
//defining global variables
const PORT = process.env.PORT || 3002;

//conncting to services
const app = express();
const runMongoDB = async () => {
    await connectDB();
}
runMongoDB()

//Initialize middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.set('trust proxy', true);

//testing endpoint
app.get('/', (req, res) => {
    return res.status(200).json({
        msg: "We are glad you like experimenting, but there's nothing here",
        live: true
    });
});

// Defining routes
app.use('/api/resources', require('./routes/manageResources'))
app.use('/api/requests', require('./routes/manageRequests'))
app.use('/api/login', require('./routes/login'))
app.use('/api/get/', require('./routes/getResources'))

app.get('*', (req, res) => {
    return res.status(404).json({ msg: 'There is nothing to see here' });
});


//starting the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});