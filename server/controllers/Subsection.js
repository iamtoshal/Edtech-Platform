const SubSection = require('../models/subSection');
const Section = require('../models/Section');
const uploadImageToCloudinary = require('../utils/imageUploader');

//create Subsection

exports.createSubsection = async (req, res) => {
    try {
        //fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);


        //create a sub section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            video: uploadDetails.secure_url,
        })



        //update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    SubSection: SubSectionDetails._id,
                },
            },
            { new: true }
        )
        //TODO : Log updated section section after updating subsection with objectId


        //return response
        return res.status(200).json({
            success: true,
            message: "Subsection created successfully",
            updatedSection,
        })


    } catch (err) {
        return res.status(500).json({
            success: true,
            message: "Internal Server error during creating subsection",
            error: err.message,
        })

    }
}


//TODO : update sunsection
exports.updateSubSection = async (req, res) => {
    try {
        //data fetch
        const { subSectionId, title, timeDuration, description, video } = req.body;

        //validation
        if (!subSectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        //updating subsection
        const subSection = await SubSection.findByIdAndUpdate({ subSectionId }, {
            title, timeDuration, description, video
        },
            { new: true },
        )

        //return response
        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            subSection,
        })


    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error During Update Subsection"
        })
    }
}


//TODO : Delete subsection
exports.deleteSubSection = async (req, res) => {
    try {
        // //data fetch
        const { subSectionId, title, timeDuration, description, video } = req.body;

        await SubSection.findByIdAndUDelete(subSectionId);

        //return res
        return res.status(200).json({
            success: true,
            message: "SubSection deleted Successfully"

        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to Delete SubSection,please try again",
            error: err.message
        })
    }
}