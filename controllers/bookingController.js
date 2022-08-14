const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  //   console.log(tour);

  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/bookings/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&${
      tour.price
    },`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug},`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // line_items: [
    //   {
    //     name: `${tour.name} Tour`,
    //     description: tour.summary,
    //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    //     amount: tour.price * 100,
    //     currency: 'usd',
    //     quantity: 1,
    //   },
    // ],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);

  next();
});

exports.getMyToursBooked = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({ user: req.user.id });

  const tourIDs = booking.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    title: 'My Tours',
    tours,
  });
});

////////////////////////////////////
// this one is for front end stripe webhook

// const createBookingCheckout2 = async (session) => {
//   const tour = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email })).id;
//   const price = session.line_items[0].unit_amount / 100;
//   await Booking.create({ tour, user, price });
// };

// exports.webhookController = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`weebhook Error: ${err.message}`);
//   }
//   if (event.type === 'checkout.session.complete')
//     createBookingCheckout2(event.data.object);

//   res.status(200).json({ received: true });
// };

exports.createBooking = factory.createOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
