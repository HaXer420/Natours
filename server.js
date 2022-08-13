const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION.... Shutting Down.....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Success DB connection!'));

// const testtour = new Tour({
//   name: 'Massab Hiking',
//   price: 490,
// });

// testtour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR :', err);
//   });

// mongoose.connect(`${process.env.DATABASE}`).then(() => {
//   console.log("DB connection successfully established");
// });

const port = process.env.PORT || 3000;
console.log(process.env.NODE_ENV);
// server start
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION.... Shutting Down.....');
  server.close(() => {
    process.exit(1);
  });
});
