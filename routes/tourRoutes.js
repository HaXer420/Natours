const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const viewController = require('../controllers/viewController');
const reviewRouter = require('./reviewRoutes');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use('/:tourid/reviews', reviewRouter);

// router.param('id', tourController.checkID);

router.get('/', tourController.getAllTours);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.TourStats);

router
  .route('/topmonthly/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.TopMonthly
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.tourNear);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// router.post(
//   '/:tourid/reviews',
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview
// );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImg,
    tourController.resizeTourImg,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
