const ErrorResponse = require('../utils/errorResponse');
const asyncHanlder = require('../middleware/async');
const Course = require('../models/Course');
const Category = require('../models/Category');


// @desc    get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/categories/:categoryId/courses
// @access  Public
exports.getCourses = asyncHanlder(async(req, res, next) => {
    if (req.params.categoryId) {
        const courses = await Course.find({ category: req.params.categoryId });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);

    }
})

// @desc    get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHanlder(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'category',
        select: 'name desc'
    });

    if (!course) {
        return next(new ErrorResponse(`no course with id ${eq.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Add course
// @route   POST /api/v1/category/:categoryId/courses
// @access  Private
exports.addCourse = asyncHanlder(async(req, res, next) => {
    req.body.category = req.params.categoryId;
    req.body.user = req.user.id;

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
        return next(new ErrorResponse(`no category with id ${eq.params.categoryId}`, 404));
    }

    //Make the user is the course owner
    if (category.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add course to category ${category._id}`, 401))
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHanlder(async(req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`no course with id ${req.params.id}`, 404));
    }

    //Make the user is the course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course to category ${course._id}`, 401))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHanlder(async(req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`no course with id ${req.params.id}`, 404));
    }

    //Make the user is the course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course to category ${course._id}`, 401))
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
})