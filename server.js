const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//Dotenv is a zero-dependency module that loads environment variables from a .env file
dotenv.config({ path: './config/config.env' });
//connecting to the database
connectDB();

//require function takes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//middleware for uploading files
app.use(fileupload());

//recognizes unwanted characters in data and changes it to characters that are allowed
app.use(mongoSanitize());

//The top level func  is a wrapper around 11 smaller middleware
//helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

//xaa is amodule used to filter input from users to prevent xss attacks
app.use(xss());

//Limits the amount of data that can be requested by the API
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(hpp());

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
