const mongoose = require("mongoose");

const userName = new mongoose.schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubSection',
        }
    ],

})

module.exports = mongoose.model("CourseProgress", userSchema)