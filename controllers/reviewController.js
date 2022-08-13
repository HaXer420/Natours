const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourid) filter = { tour: req.params.tourid };

//   const review = await Review.find(filter);
//   // .populate({
//   //   path: 'user',
//   //   select: '-__v -passwordChangedAt -active',
//   // })
//   // .populate({
//   //   path: 'tour',
//   //   select: '-__v -id -secretTour',
//   // });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       reviews: review,
//     },
//   });
// });

exports.setTourUser = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user.id;
  next();
  // const review = await Review.create(req.body);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     reviews: review,
  //   },
  // });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
