const express = require('express');
const dotenv = require('dotenv');
const categoryRouter = require('./routes/category');
const courseRouter = require('./routes/course');
const authRouter = require('./routes/auth');
const morgan = require('morgan'); // 3rd part middleware
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const path = require('path');

// load env vars
dotenv.config({ path: './config/config.env' })
const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

// Body parser
app.use(express.json())

// CookieParser
app.use(cookieParser());

// Dev lodding middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Set public folder as static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/auth', authRouter);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} env on port ${PORT}`)
});