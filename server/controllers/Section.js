const Section = require("../models/Section");
const Course = require('../models/Course');

exports.createSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, courseId } = req.body;

        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            })
        }

        //create section
        const newSection = await Section.create({ sectionName });

        //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            }
        }).exec();

        //return response
        return res.status(200).json({
            success: true,
            message: "Section created Successfully",
            updatedCourseDetails,
        })


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to Create section,please try again",
            error: err.message,
        })

    }
}

exports.updateSection = async (req, res) => {
    try {
        //data input
        const { sectionName, sectionId } = req.body;

        //data visualization
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true })

        //return response
        return res.status(200).json({
            success: true,
            message: "Section updated Successfully",
        })


    } catch (err) {
        console.error("Error updating section:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to Update section,please try again",
            error: err.message
        })
    }
}


exports.deleteSection = async (req, res) => {
    try {
        //data fetch
        //get ID - assuming  that we are sending ID in params
        //TODO: test with req.params
        const { sectionId } = req.body;

        //TODO :do we need to delete entry from the schema
        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);


        //return response
        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfully",
        })



    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to Delete section,please try again",
            error: err.message
        })
    }
}