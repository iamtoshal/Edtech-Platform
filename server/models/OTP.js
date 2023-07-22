const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60 * 5,
    }
})

//pre-middleware
//pre-hook is written down to the schema and up to the module
//a function to send mail
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from Studynotion ", emailTemplate(otp));
        console.log("Email sent succesfully", mailResponse);

    }
    catch (error) {
        console.log("Error occured while sending emails", error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {
    console.log("New Account saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);