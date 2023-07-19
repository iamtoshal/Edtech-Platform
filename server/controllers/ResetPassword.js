const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');


//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req body
        const email = req.body.email;

        //check user for this mail,email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: 'Your email is not registered with us'
            })
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        },
            // { new: true } will return updated details in response
            { new: true }
        );


        //create url
        const url = `http://localhost:3000/update-password/${token}`;

        //send emil containing the url
        await mailSender(email, 'Password Reset Link',
            `Password Reset Link ${url}`);

        //return response
        return res.json({
            success: true,
            message: "Email sent successfully,please check mail and password"
        })




    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong,while reset password",
        })
    }

}


//resetPassword

exports.resetPassword = async (req, res) => {
    try {
        //data fetch
        const { password, confirmPassword, token } = req.body;

        //validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: 'Password not mathcing',
            });
        }

        //get userdetails from db using token
        const userDetails = await User.findOne({ token: token });

        //if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: 'Token is invalid',
            })
        }

        //time checking
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'token is expired,please regenerate token'
            })
        }

        //hash pasword
        const hashedPassword = await bcrypt.hash(password, 10);


        //update passowrd
        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        );


        //return response
        return res.ststua(200).json({
            success: true,
            message: "Password reset successful",
        })


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong,while reset password",
        })
    }
}