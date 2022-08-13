const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tours = require('../../models/tourModel');
const Users = require('../../models/userModel');
const Reviews = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Success DB connection!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tours.create(tours);
    await Users.create(users, { validateBeforeSave: false });
    await Reviews.create(reviews);
    console.log('Uploaded Done!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tours.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log('Delete Done!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
