const User = require("../models/User");
const OTP = require("../models/OTP");

const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require("dotenv").config();




//SendOTP
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from request body
        const { email } = req.body;

        //check if usera already exists
        const checkUserPresent = await User.findOne({ email });

        ///if user already exists then teturn response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }


        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log("OTP generated : ", otp)

        //check unique otp or not
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        //create an entry in db for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successful
        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })


    } catch (err) {
        console.log(err);
        return res(500).json({

            success: false,
            message: err.message
        })
    }

}

//signup
exports.signUp = async (req, res) => {
    try {
        //data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validating data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                succcess: false,
                message: "All fields are required",
            })
        }


        // 2 password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password value does not match",
            })
        }


        //check user already exist or not
        const exisytingUser = await User.findOne({ email });
        if (exisytingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registerd",
            })
        }


        //find most recent OTP shared for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("Recent OTP : ", recentOtp);


        //validate otp
        if (recentOtp.length == 0) {
            //OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            })
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            })
        }


        //Hash Paaword
        const hashedPassword = await bcrypt.hash(password, 10);


        //Entry create in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const user = await User.Create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            additionalDetails: profileDetails._id,
            image: `https:api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        //return response
        return res.status(200).json({
            success: true,
            message: "User registered Successfully",
            user,
        })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered.Please try again!!"
        })
    }
}


//login
exports.login = async (req, res) => {
    try {
        //get data from req body
        const { email, password } = req.body;

        //validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required,please try again"
            })
        }

        //user check exists or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        // If user not found with provided email
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered,please signup first"
            })
        }


        //generate JWT,after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                message: "Logged In Successfully",
                token,
                user,
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            })
        }



    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login failure,please try again "
        })
    }

}


//TODO : change password
//changePassword
exports.changePassword = async (req, res) => {
    //get data from req body
    //get oldPassword,newPassword,confirmPassword
    //validation

    //update pwd in DB
    //send mail - password updated
    //return response
}