const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgotpassword').post(authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePass);
router.patch(
  '/updateMe',
  userController.uploadUserImg,
  userController.UserImgResize,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.route('/getme').get(userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
