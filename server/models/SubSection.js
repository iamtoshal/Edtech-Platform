const mongoose = require("mpongoose");

const subSection = new mongoose.schema({
    title: {
        type: String
    },
    timeDuration: {
        type: String
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
    }
});

module.exports = mongoose.model("SubSection", subSection)