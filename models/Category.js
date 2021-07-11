const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    displayName: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    desc: {
        type: String,
        required: [true, 'Please add a desc'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    count: {
        type: Number
    },
    averageCost: {
        type: Number
    },
    tags: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Design',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate category displayName from the name
CategorySchema.pre('save', function(next) {
    this.displayName = slugify(this.name, { upper: true });
    // name: aaa bbb => displayName: Aaa-Bbb
    next();
})

// Cascade delete courses when a category is deleted
CategorySchema.pre('remove', async function(next) {
    console.log(`Courses being removed from category ${this._id}`);
    await this.model('Course').deleteMany({ category: this._id });
    next();
});

// Reverse populate with virtuals
CategorySchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'category',
    justOne: false
});

module.exports = mongoose.model('Category', CategorySchema);