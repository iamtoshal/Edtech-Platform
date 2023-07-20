const Category = require("../models/Category");

//create Tag handler functions

exports.createCategory = async (req, res) => {
    try {
        //fetch data
        const { name, description } = req.body;

        //validating tags name and description
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })

        }

        //create entry in db
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log("tag details : ", tagDetails)

        //return response
        return res.status(200).json({
            message: true,
            message: 'Tag Created Successfully',
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

//getAllTags handler function 

exports.showAllCategory = async (req, res) => {
    try {
        //here we are searching on the basis of any criteria,just get all
        //entries and make sure that entries contains name and decsription
        const allTags = await Tag.find({}, { name: true, description: true });

        res.status(200).json({
            success: true,
            message: 'All tags returned successfully',
            allTags,
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

//categoryPageDetails 


exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const { categoryId } = req.body;

        //get category for specified categoryID
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        //valicdation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Data not found",
            })
        }

        //get course for different categories

        // get top selling courses 

        //return response

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
