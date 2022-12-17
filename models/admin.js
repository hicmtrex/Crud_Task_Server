const mongoose = require('mongoose');
const schema = mongoose.Schema;

const postTask = new schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'In-Progress',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tasks', postTask);
