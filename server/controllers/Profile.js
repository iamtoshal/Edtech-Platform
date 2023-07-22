const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
    try {
        //get data
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        //get user id
        const id = req.user.id;

        //validation
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        //find profile
        const userDetails = await User.findById(id)
        const profileDetails = await Profile.findById(userDetails.additionalDetails);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        // Save the updated profile
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong during profile update",
            error: error.message
        })

    }
}

//Delete Account

exports.deleteAccount = async (res, res) => {
    try {

        //TODO : Explore -> How can we schedule this deletion operation -> Cron Jobs
        // TODO: Find More on Job Schedule
        // const job = schedule.scheduleJob("10 * * * * *", function () {
        // 	console.log("The answer to life, the universe, and everything!");
        // });
        // console.log(job);


        console.log("Printing ID: ", req.user.id);
        //get id
        const id = req.user.id;

        //validation
        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        //delete Profile
        await Profile.findByIdAndDelete({ _id: user.additionalDetails });

        //delete User
        await User.findByIdAndDelete({ _id: id });

        //TODO: HW unenroll user  from all enrolled courses
        //return response
        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to Delete Profile,please try again",
            error: err.message,
        });

    }
}

exports.getAllUserDetails = async (req, res) => {
    try {

        //get id
        const id = req.user.id;

        //validation & get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        console.log(userDetails);


        //return response
        return res.status(200).json({
            success: true,
            message: "User Details fetched Successfully",
            data: userDetails,
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch User Details ",
            error: err.message,
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )

        res.send({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findOne({
            _id: userId,
        }).populate("courses").exec();

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id : ${userDetails}`,
            })
        }

        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}