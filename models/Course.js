const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a cource title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    cost: {
        type: Number,
        required: [true, 'Please add the cost']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});
// static method to get avg of course cost
CourseSchema.statics.getAverageCost = async function(categoryId) {
    const obj = await this.aggregate([{
            $match: { category: categoryId }
        },
        {
            $group: {
                _id: '$category',
                averageCost: { $avg: '$cost' }
            }
        }
    ]);

    // save average cost into database
    try {
        await this.model('Category').findByIdAndUpdate(categoryId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (err) {
        console.err(err);
    }
}

// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.category);
});

// Call getAverageCost before remove
CourseSchema.post('remove', function() {
    this.constructor.getAverageCost(this.category);
});

module.exports = mongoose.model('Course', CourseSchema);