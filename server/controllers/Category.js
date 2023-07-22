const Category = require("../models/Category");

//create Tag handler functions

exports.createCategory = async (req, res) => {
    try {
        //fetch data
        const { name, description } = req.body;

        //validating tags name and description
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })

        }

        //create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log("tag details : ", categoryDetails)

        //return response
        return res.status(200).json({
            message: true,
            message: 'Categories Created Successfully',
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
        const allCategory = await Tag.find({}, { name: true, description: true });

        res.status(200).json({
            success: true,
            message: 'All tags returned successfully',
            data: allCategory,
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

        //validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Data not found",
            })
        }

        //get course for different categories
        const differentCategories = await Category.find({
            _id: { $ne: categoryId },
        }).populate('courses').exec();

        // get top selling courses 
        //TODO: top selling course


        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
