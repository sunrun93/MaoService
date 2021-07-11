const express = require('express');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory, categoryPhotoUpload } = require('../controller/category')
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const Category = require('../models/Category');


// Include other resource routers
const courseRouter = require('./course');

const router = express.Router();

// Re-route into other resouse router
router.use('/:categoryId/courses', courseRouter);

router
    .route('/')
    .get(advancedResults(Category, 'courses'), getCategories)
    .post(protect, authorize('publisher', 'admin'), createCategory);

router
    .route('/:id')
    .get(getCategory)
    .put(protect, authorize('publisher', 'admin'), updateCategory)
    .delete(protect, authorize('publisher', 'admin'), deleteCategory);

router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), categoryPhotoUpload);

module.exports = router;