const helmet = require('helmet');
const hpp = require('hpp');
const express = require('express');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
// const morgan = require('morgan');
const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

//start express app
const app = express();

// Global Middlewares
app.use(helmet());
// console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// if (process.env.NODE_ENV === 'production') {
//   console.log('Production version');
// }

const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: ' To many requests to the API please try again after an hour',
});

app.use('/api', limiter);

app.use(express.json({ limit: '20kb' }));

app.use(sanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });

app.use(compression());

app.use((req, res, next) => {
  req.requestBody = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).json(['Message: Im coming from route 1', 'Status: success']);
// });

// app.post('/', (req, res) => {
//   res.send('Message: Im coming from post');
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Couldn't find the ${req.originalUrl} url`,
  // });
  // const err = new Error(`Couldn't find the ${req.originalUrl} url`);
  // err.status = 'failed to get';
  // err.statusCode = 404;

  next(new AppError(`Couldn't find the ${req.originalUrl} url`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
