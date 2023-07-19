const Profile = require("../models/Profile");
const User = require("../models/User");

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
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
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
//TODO : Explore -> How can we schedule this deletion operation -> Cron Jobs
exports.deleteAccount = async (res, res) => {
    try {
        //get id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            })
        }

        //delete Profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

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
        const userDetails = await User.findById(id).populate(additionalDetails).exec();

        //return response
        return res.status(200).json({
            success: true,
            message: "User Details fetched Successfully",
            userDetails,
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch User Details ",
            error: err.message,
        })
    }
}