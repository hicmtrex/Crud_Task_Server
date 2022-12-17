const { validationResult } = require('express-validator');
const taskSchema = require('../models/admin');
const userSchema = require('../models/users');
const path = require('path');
const fs = require('fs');

exports.getTasks = (req, res, next) => {
  const currentPage = req.query.page,
    limit = req.query.limit;
  let totalItems;
  taskSchema
    .find(res.locals.filter)
    .countDocuments()
    .then((search) => {
      totalItems = search;
      return taskSchema
        .find(res.locals.filter)
        .populate('userId')
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 });
    })
    .then((result) => {
      if (!result) {
        const error = new Error('No Tasks Found');
        error.statusCode = 200;
        throw error;
      } else {
        res.status(200).json({
          tasks: result,
          totalItems: totalItems,
        });
      }
    })
    .catch((err) => {
      const error = new Error('No Tasks Found');
      error.statusCode = 400;
      throw error;
    });
};

exports.createTask = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({
      massage: 'title invalid',
      errors: err.array(),
    });
  }
  const imageUrl = req.file.path;
  const postTask = new taskSchema({
    title: req.body.title,
    userId: req.body.userId,
    image: imageUrl,
    description: req.body.description,
    deadline: req.body.deadline,
  });

  postTask
    .save()
    .then(() => {
      userSchema.findByIdAndUpdate(req.body.userId).then((user) => {
        user.assignedTasks = ++user.assignedTasks;
        user.save();
      });
      res.status(201).json({
        massage: 'Task Created Successfully',
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.editTask = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({
      massage: 'title invalid',
      errors: err.array(),
    });
  }

  const title = req.body.title;
  const description = req.body.description;
  const deadline = req.body.deadline;
  const userId = req.body.userId;
  let image = req.body.image;
  if (req.file) {
    image = req.file.path;
  }
  if (!image) {
    let error = new Error('No Image Uploaded');
    error.statusCode = 422;
    throw error;
  }
  taskSchema
    .findByIdAndUpdate(req.params.id)
    .then((result) => {
      if (!result) {
        let error = new Error('No Task Found With This ID...');
        error.statusCode = 404;
        throw error;
      }
      if (image !== result.image) {
        clearImage(result.image);
      }
      result.title = title;
      result.description = description;
      result.deadline = deadline;
      result.userId = userId;
      result.image = image;
      return result.save();
    })
    .then((status) => {
      res.status(200).json({
        massage: 'Task Updated Successfully',
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.deleteTask = (req, res, next) => {
  taskSchema
    .findById(req.params.id)
    .then((result) => {
      if (!result) {
        let error = new Error('No Task Found With This ID...');
        error.statusCode = 404;
        throw error;
      }
      clearImage(result.image);
    })
    .then((status) => {
      taskSchema.findByIdAndRemove(req.params.id).then((result) => {
        userSchema.findByIdAndUpdate(result.userId).then((user) => {
          user.assignedTasks = --user.assignedTasks;
          user.save();
        });
        res.status(200).json({ massage: 'Task Updated Successfully' });
      });
    });
};

exports.getUserTasks = (req, res, next) => {
  const currentPage = req.query.page,
    limit = req.query.limit,
    status = req.query.status;
  taskSchema
    .find({ userId: req.userData.userId, status: status })
    .countDocuments()
    .then((result) => {
      if (!result) {
        let error = new Error('No Tasks Found Assgined To This ID...');
        error.statusCode = 400;
        throw error;
      }
      totalItems = result;
      return taskSchema
        .find({ userId: req.userData.userId, status: status })
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 });
    })
    .then((status) => {
      res.status(200).json({ tasks: status });
    })
    .catch((err) => {
      next(err);
    });
};

exports.taskDetails = (req, res, next) => {
  const taskId = req.params.id;

  taskSchema
    .findById(taskId)
    .then((result) => {
      if (!result) {
        let error = new Error('No Task Found With This ID...');
        error.statusCode = 400;
        throw error;
      }
      return result;
    })
    .then((status) => {
      res.status(200).json({ tasks: status });
    })
    .catch((err) => {
      next(err);
    });
};

exports.completeTask = (req, res, next) => {
  let taskId = req.body.id;
  taskSchema.findByIdAndUpdate(taskId).then((result) => {
    if (!result) {
      let error = new Error('No Task Found With This ID...');
      error.statusCode = 400;
      throw error;
    }
    result.status = 'Complete';
    result.save().then((success) => {
      userSchema.findByIdAndUpdate(result.userId).then((user) => {
        user.assignedTasks = --user.assignedTasks;
        user.save().then((done) => {
          res.status(200).json({ massage: 'Task Complete Successfully' });
        });
      });
    });
  });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
