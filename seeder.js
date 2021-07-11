const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// load env environments
dotenv.config({
    path: './config/config.env'
});

// load models
const Category = require('./models/Category');
const Course = require('./models/Course');
const User = require('./models/User');

// connect to db
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

// read json files
const categories = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/category.json`, 'utf-8')
);

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/course.json`, 'utf-8')
);

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/user.json`, 'utf-8')
);

// Import to DB
const importData = async() => {
    try {
        await Category.create(categories);
        await Course.create(courses);
        await User.create(users);

        console.log('Data imported');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// delete categories
const deleteData = async() => {
    try {
        await Category.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        console.log('Data deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}