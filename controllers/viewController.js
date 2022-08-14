const Tour = require('../models/tourModel');
// const Booking = require('../models/bookingModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

///////////////////////////////
// this handler is for pop-up after some process is done

// exports.alerts = (req, res, next) => {
//   const { alerts } = req.query;

//   if (alert === 'booking') res.locals.alert = 'Your booking was succesfull!';

//   next();
// };

exports.getOverview = catchAsync(async (req, res, next) => {
  const tour = await Tour.find();

  res.status(200).json({
    status: 'success',
    title: 'All tours',
    data: {
      tour,
    },
  });
  next();
});

//////////////////////////
// MOVED THIS TO BOOKING CONTROLLER

// exports.getMyTours = catchAsync(async (req, res, next) => {
//   const booking = await Booking.find({ user: req.user.id });

//   const tourIDs = booking.map((el) => el.tour);
//   const tours = await Tour.find({ _id: { $in: tourIDs } });

//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     title: 'My Tours',
//     tours,
//   });
// });
