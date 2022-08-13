const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');

// const MulterStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserImg = upload.single('photo');

exports.UserImgResize = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// filteredobj func

const currObj = (obj, ...fieldsallowed) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldsallowed.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// users handler
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const user = await User.find();

//   res.status(200).json({
//     datenow: req.requestBody,
//     status: 'success',
//     result: user.length,
//     data: {
//       user,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  // check if updating password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating password please user update password for that!',
        400
      )
    );
  }

  // filtering user

  const filteredObject = currObj(req.body, 'name', 'email');
  if (req.file) filteredObject.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredObject,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const userD = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is yet to be implemented',
  });
};

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This route is yet to be implemented',
//   });
// };

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
