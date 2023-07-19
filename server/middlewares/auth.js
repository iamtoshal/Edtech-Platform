const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User')



//auth
exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace('Bearer ', "");

        //if token missing,then return res
        if (!token) {
            return res.status(401).json({
                succes: false,
                message: "Token is missing",
            })
        }

        //verify the token
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Payload : ", payload);
            req.user = payload;

        } catch (err) {
            //verification - issue
            return res.status(401).json({
                succes: false,
                message: "token is invalied"
            })

        }
        next();


    } catch (error) {
        return res.staus(401).json({
            success: true,
            message: "Something went wrong while validating token"
        })

    }
}


//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Student') {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for students only'
            })
        }
        next();


    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "User role cannot verified,try agaim"
        })
    }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Insttuctor') {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for instructor only'
            })
        }
        next();


    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "User role cannot verified,try agaim"
        })
    }
}




//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for admin only'
            })
        }
        next();


    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "User role cannot verified,try agaim"
        })
    }
}

