const Course = require('../models/Course');
const Tag = require('../models/tags');
const User = require('../models/User');
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {

        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.staus(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details", instructorDetails);
        //TODO : verify instructor id and user id same or different 

        //TODO : check the spelling of instructor


        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instrcutor Details not found",
            })
        }


        //check given tag is valid ot not
        const tagDetails = await Tag.findById(tag);

        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details not found",
            })
        }

        //Upload Image top cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            Instrcutor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails.tag,
            thumbnail: thumbnailImage.secure_url,
        })

        //add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        )

        //TODO:update the tag schema - HW
        await Tag.findByIdAndUpdate({ tag },
            {
                tag: tagDetails.tag,
            },
            { new: true }
        )

        //return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        })



    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })

    }
}



//getAllCourses handler function
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instrcutor: true,
            ratingAndReviews: true,
            studentsEnrolled: true
        }).populate('instructor').exec();

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        })



    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: err.message
        })

    }
}

//getCourseDetaiss
exports.getCourseDetails = async (req, res) => {
    try {
        //get id
        const { courseId } = req.body;

        //find course details
        const courseDetails = await Course.find({ _id: courseId }).populate({
            path: "instructor",
            populate: {
                path: "additionalDetails"
            }
        })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            }).exec();

        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with course id : ${courseId}`,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
        });

    } catch (err) {
        console.log(err)
        return res.status().json({
            success: false,
            message: err.message,
        })
    }
}