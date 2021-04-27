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
connectDB();

//Initialize middlewares
app.use(cors())
app.use(express.json({ extended: false }));

//testing endpoint
app.get('/', (req, res) => {
    return res.status(200).json({
        msg: "We are glad you like experimenting, but there's nothing here",
        live: true
    });
});

// Defining routes
app.use('/api/ventilator', require('./routes/getVentilator'))
app.use('/api/oxygen', require('./routes/getOxygen'))
app.use('/api/beds', require('./routes/getBeds'))
app.use('/api/plasma', require('./routes/getPlasma'))
app.use('/api/all', require('./routes/getAll'))


app.get('*', (req, res) => {
    return res.status(404).json({ msg: 'There is nothing to see here' });
});


//starting the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});