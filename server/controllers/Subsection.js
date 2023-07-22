const SubSection = require('../models/subSection');
const Section = require('../models/Section');
const uploadImageToCloudinary = require('../utils/imageUploader');

//create Subsection

exports.createSubSection = async (req, res) => {
    try {
        //fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            })
        }
        console.log(video);

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        console.log(uploadDetails);

        //create a sub section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })



        //update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    SubSection: SubSectionDetails._id,
                },
            },
            { new: true }
        ).populate("subSection");
        //TODO : Log updated section after updating subsection with objectId


        //return response
        return res.status(200).json({
            success: true,
            message: "Subsection created successfully",
            data: updatedSection,
        })


    } catch (err) {
        return res.status(500).json({
            success: true,
            message: "Internal Server error during creating subsection",
            error: err.message,
        })

    }
}


// //update Subsection
// exports.updateSubSection = async (req, res) => {
//     try {
//         //data fetch
//         const { subSectionId, title, timeDuration, description, video } = req.body;

//         //validation
//         if (!subSectionId || !title || !timeDuration || !description || !video) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required",
//             })
//         }

//         //updating subsection
//         const subSection = await SubSection.findByIdAndUpdate({ subSectionId }, {
//             title, timeDuration, description, video
//         },
//             { new: true },
//         )

//         //return response
//         return res.status(200).json({
//             success: true,
//             message: "SubSection updated successfully",
//             subSection,
//         })


//     }
//     catch (err) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error During Update Subsection"
//         })
//     }
// }


// // Delete subsection
// exports.deleteSubSection = async (req, res) => {
//     try {
//         // //data fetch
//         const { subSectionId } = req.body;

//         await SubSection.findByIdAndUDelete(subSectionId);

//         //return res
//         return res.status(200).json({
//             success: true,
//             message: "SubSection deleted Successfully"

//         })
//     }
//     catch (err) {
//         return res.status(500).json({
//             success: false,
//             message: "Unable to Delete SubSection,please try again",
//             error: err.message
//         })
//     }
// }



exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body
        const subSection = await SubSection.findById(sectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        return res.json({
            success: true,
            message: "Section updated successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}