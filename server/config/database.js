const mongoose = require("mongoose");

require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => { console.log("DB Connected Successfull..") })
        .catch((err) => {
            console.log("DB Connection failed")
            console.log(err)
            process.exit(1)
        })
}

