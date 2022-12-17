const mongoose = require('mongoose');
const schema = mongoose.Schema;

const getUsers = new schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    assignedTasks: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: 'user',
      // required:true
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', getUsers);
