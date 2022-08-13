const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must have a name'],
      unique: [true, 'Name must be unique'],
      trim: true,
      minlength: [10, 'must have >10 length'],
      maxlength: [50, 'must have <50 length'],
      // validate: [validator.isAlpha, 'Tour only contain character'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'not a valid difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must have rating above or equal 1'],
      max: [5, 'must have rating below or equal 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'Must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount is not valid',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual

TourSchema.virtual('TotalWeeks').get(function () {
  return this.duration / 7;
});

TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// middleware documnets ---> for save and create

// TourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// TourSchema.pre('save', function (next) {
//   console.log('saving document.......');
//   next();
// });

// TourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// query middleware

//index
TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });

TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -secretTour',
  });
  next();
});

TourSchema.post(/^find/, function (docs, next) {
  console.log(`The time took is: ${Date.now() - this.start} milli secs`);
  // console.log(docs);
  next();
});

// aggregation middleware
// TourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

////////////
// For embedding
// TourSchema.pre('save', async function (next) {
//   const guidePromise = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidePromise);
//   next();
// });

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
