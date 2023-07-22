const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const mongoose = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;

        //fetch data 
        const { rating, review, courseId } = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $eleMatch: { $eq: userId } },
            })

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course",
            })
        }


        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        })

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewd by user",
            })
        }

        //create rating & review
        const ratingAndReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        //update course with review/rating
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingAndReview._id,
                },
            },
            { new: true });
        console.log(updatedCourseDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created Successfully!",
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}



//getAverage Rating
exports.getAverageRating = async (req, res) => {
    try {
        //get Course ID
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ]);

        //return string
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
                message: "Average rating calculated",
            })
        }

        //no rating and review exist
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0,no rating given till now",
            averageRating: 0,
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        })

    }
}



//getAllRatingAndReviews
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({}).sort({ rating: "desc" }).populate({
            path: "user",
            select: "firstname lastname email image",
        }).populate({
            path: "course",
            select: "courseName",
        }).exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
