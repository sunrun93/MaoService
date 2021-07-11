const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    fetch all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async(req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: category });
});

// @desc    create category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async(req, res, next) => {
    // Add user to request body
    req.body.user = req.user.id;

    // check the published category
    const publishedCategory = await Category.findOne({ user: req.user.id });
    console.log(req.user);
    if (publishedCategory && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }

    const category = await Category.create(req.body);
    res.status(201).json({
        success: true,
        data: category
    })
});

// @desc    update single category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async(req, res, next) => {
    let category = await Category.findById(req.params.id);

    //Make the user is the category owner
    if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update the category`, 401))
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!category) {
        res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: category });
});

// @desc    delete single category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async(req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(400).json({ success: false });
    }

    //Make the user is the category owner
    if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete the category`, 401))
    }

    category.remove();
    return res.status(200).json({ success: true });
});

// @desc    upload photo for single category
// @route   PUT /api/v1/categories/:id/photo
// @access  Private
exports.categoryPhotoUpload = asyncHandler(async(req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found for id ${req.params.id}`, 404));
    }

    //Make the user is the category owner
    if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update the category`, 401))
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }
    const file = req.files.files;
    // console.log(file);

    // make sure the file is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    file.name = `photo_${category.id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        await Category.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            date: file.name
        })
    });

    console.log(file.name);

});