const express = require('express');
const viewControllers = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
// const Booking = require('../models/bookingModel');

const router = express.Router();

// router.get('/', authController.protect, bookingController.createBookingCheckout, viewControllers.getOverview)
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.protect,
  viewControllers.getOverview
);

router.get('/my-tours', authController.protect, viewControllers.getMyTours);

module.exports = router;
