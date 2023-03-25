const mongoose = require("mongoose")
require('dotenv').config()

mongoose.set('strictQuery', false)


const connect = async () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: true
    };
    try {
        await mongoose.connect(process.env.mongoUrl, connectionParams);
        console.log("connected to database successfully");
    } catch (error) {
        console.log("could not connect to database.", error);
    }
};

module.exports = { connect }