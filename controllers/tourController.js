const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');
const { promises } = require('nodemailer/lib/xoauth2');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`tour id is : ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'invalid',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'invalid name or price',
//     });
//   }
//   next();
// };

// tour handlers

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  console.log('hiii');
  next();
};

const MulterStorage = multer.memoryStorage();

const MulterFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('File format is not correct please choose an image!', 400),
      false
    );
  }
};

const upload = multer({
  storage: MulterStorage,
  fileFilter: MulterFilter,
});

exports.uploadTourImg = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImg = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1) cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // multiple images

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 85 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// class APIFeatures {
//   constructor(query, queryStr) {
//     this.query = query;
//     this.queryStr = queryStr;
//   }

//   filter() {
//     const queryObj = { ...this.queryStr };
//     const queryEle = ['page', 'sort', 'limit', 'fields'];
//     queryEle.forEach((el) => delete queryObj[el]);

//     // advance filtering
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // console.log(JSON.parse(queryStr));
//     this.query = this.query.find(JSON.parse(queryStr));
//     // console.log(queryObj);
//     // let query = Tour.find(JSON.parse(queryStr));
//     return this;
//   }

//   sorting() {
//     if (this.queryStr.sort) {
//       const sortBy = this.queryStr.sort.split(',').join(' ');
//       // console.log(sortBy);
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort('-createdAt');
//     }

//     return this;
//   }

//   field() {
//     if (this.queryStr.fields) {
//       const fieldBy = this.queryStr.fields.split(',').join(' ');
//       // console.log(fieldBy);
//       this.query = this.query.select(fieldBy);
//     } else {
//       this.query = this.query.select('-__v');
//     }

//     return this;
//   }

//   paging() {
//     const page = this.queryStr.page * 1 || 1;
//     const limit = this.queryStr.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }
// }

// exports.getAllTours = catchAsync(async (req, res) => {
//   try {
//     // console.log(req.query);

//     //filtering
//     // const queryObj = { ...req.query };
//     // const queryEle = ['page', 'sort', 'limit', 'fields'];
//     // queryEle.forEach((el) => delete queryObj[el]);

//     // // advance filtering
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // console.log(JSON.parse(queryStr));

//     // // console.log(queryObj);
//     // let query = Tour.find(JSON.parse(queryStr));

//     // sorting

//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   // console.log(sortBy);
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt');
//     // }

//     //fields, selection

//     // if (req.query.fields) {
//     //   const fieldBy = req.query.fields.split(',').join(' ');
//     //   // console.log(fieldBy);
//     //   query = query.select(fieldBy);
//     // } else {
//     //   query = query.select('-__v');
//     // }

//     // paging,limits
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;

//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //   const MaxNumP = await Tour.countDocuments();
//     //   if (skip >= MaxNumP) throw new Error('Page not found');
//     // }

//     //query data exec

//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sorting()
//       .field()
//       .paging();

//     const tour = await features.query;

//     res.status(200).json({
//       datenow: req.requestBody,
//       status: 'success',
//       result: tour.length,
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(404).json({
//       status: 'failed',
//       message: 'invalid',
//       data: {
//         err,
//       },
//     });
//   }
// });

// exports.getTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     if (!tour) {
//       // return res.status(404).json('id not found');
//       return next(new AppError('No tour found with such id'));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       message: 'invalid',
//     });
//   }
//   //   // console.log(req.params);
//   //   // const id = req.params.id * 1;

//   //   // const tour = tours.find((el) => el.id === id);

//   //   // // if (id > tours.length)
//   //   // if (!tour) {
//   //   //   return res.status(404).json({
//   //   //     status: 'failed',
//   //   //     message: 'invalid',
//   //   //   });
//   //   // }

//   //   // res.status(200).json({
//   //   //   status: 'success',
//   //   //   data: {
//   //   //     tour,
//   //   //   },
//   //   // });
// };

// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       data: {
//         tour: err,
//       },
//     });
//   }

// const newID = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newID }, req.body);
// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tours,
//       },
//     });
//   }
// );
// };

// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!tour) {
//       return res.status(404).json('id not found');
//     }
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       data: {
//         tour: 'invalid data',
//       },
//     });
//   }
// };

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return res.status(404).json('id not found');
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       data: {
//         tour: 'invalid data',
//       },
//     });
//   }
// };

exports.TourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $sort: { avgPrice: 1 },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          totalTours: { $sum: 1 },
          totalRatings: { $sum: '$ratingsQuantity' },
          avrgRating: { $avg: '$ratingsAverage' },
          avrgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        tour: stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      data: {
        tour: 'invalid data',
      },
    });
  }
};

exports.TopMonthly = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          totalTours: { $sum: 1 },
          name: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          totalTours: -1,
        },
      },
      {
        $project: { _id: 0 },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        tour: plan,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'failed',
      data: {
        tour: 'invalid data',
      },
    });
  }
};

exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat and lng!',
        400
      )
    );
  }

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  if (tour < 1) {
    return res
      .status(200)
      .json({ message: 'no tour found in the given distance!' });
  }

  res.status(200).json({
    status: 'success',
    result: tour.length,
    data: {
      tour,
    },
  });
});

exports.tourNear = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat and lng!',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
