const mongoose = require('mongoose');

const DBConcction = (callback) => {
  mongoose
    .connect('mongodb://0.0.0.0:27017/task-mean')
    .then(() => {
      console.log('DB Connected!!');
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.DBConcction = DBConcction;
