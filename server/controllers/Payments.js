const { instance } = require('../config/razorpay');
const Course = require("../models/Course");
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require("mongoose");


//capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {

    //get courseId and userId
    const { course_id } = req.body;
    const userid = req.user.id;

    //vaidation
    if (!course_id) {
        return res.json({
            success: false,
            message: "Please provide valid course if",
        })
    }

    //valld courseDetails
    let course;
    try {
        //vali courseDetail
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: "Could not find the course",
            })
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userid);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: true,
                meessage: "Student is already enrolled",
            })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }


    //create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        recipt: Math.random(Date.now()).toString(),
        notes: {
            course: course_id,
            userid,
        }
    }

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            orderId: paymentResponse.id,
            thumbnail: course.thumbnail,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })

    } catch (err) {
        console.log(err);
        res.json({
            succes: false,
            message: "Could not initiate order"
        })
    }

}




//verify signature of razorpay and server

exports.verifySignature = async (req, res) => {
    const webHookSecret = "12345678";

    const signature = req.headers('x-razorpay-signature');

    const shasum = crypto.createHmac("sha256", webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest) {
        console.log("Payment is authorized");

        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            //fullfill the action

            //find the course and rnoll the student 
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentEnrolled: userId } },
                { new: true },
            )

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                })
            }
            console.log(enrolledCourse)

            //find the student and add the course to their enrolled courses list
            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { courses: courseId } },
                { new: true },
            )
            console.log(enrolledStudent);


            //sending confirmation mail
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from StudyNotion",
                "Congratulations, you are enrolled into new StudyNotion course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature verified amd course added",
            })

        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            })

        }


    }
    else {
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        })
    }





};