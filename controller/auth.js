const { validationResult } = require('express-validator');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.login = (req, res, next) => {
  let userLogedIn;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.StatusCode = 422;
    err.data = error.array();
    throw err;
  }

  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const err = new Error('A user with this email could be not found');
        err.StatusCode = 401;
        throw err;
      }
      userLogedIn = user;
      return bcrypt.compare(password, user.password);
    })
    .then((loged) => {
      if (!loged) {
        const err = new Error('Invalid Password');
        err.StatusCode = 401;
        throw err;
      }
      if (userLogedIn.role == role) return userLogedIn;
    })
    .then((checkRole) => {
      if (!checkRole) {
        const err = new Error('Invalid User Role');
        err.StatusCode = 401;
        throw err;
      }
      return checkRole;
    })
    .then((finalUser) => {
      if (finalUser) {
        if (userLogedIn.role == 'user' && userLogedIn.status !== 'Active') {
          const err = new Error(
            'Your Account is In-Active .. Please Contact with Adminstrator'
          );
          err.StatusCode = 401;
          throw err;
        } else {
          let token = jwt.sign(
            {
              email: userLogedIn.email,
              userId: userLogedIn._id.toString(),
            },
            'MohamedYossryFaxil',
            { expiresIn: '2d' }
          );
          res.status(200).json({
            userId: userLogedIn._id.toString(),
            token: token,
          });
        }
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.register = (req, res, next) => {
  let userLogedIn;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Validation Failed');
    err.StatusCode = 422;
    err.data = error.array();
    throw err;
  }

  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        const err = new Error('A user with this email already exist');
        err.StatusCode = 400;
        throw err;
      } else {
        return user;
      }
    })
    .then((result) => {
      if (!result) {
        bcrypt.hash(password, 12).then((hashResult) => {
          let newUser = new User({
            email: email,
            password: hashResult,
            username: username,
          });
          newUser.save().then((success) => {
            let token = jwt.sign(
              {
                email: email,
                userId: success._id.toString(),
              },
              'MohamedYossryFaxil',
              { expiresIn: '1h' }
            );
            res.status(201).json({
              userId: success._id.toString(),
              token: token,
            });
          });
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  let currentPage = req.query.page,
    limit = req.query.limit;
  User.find({
    ...res.locals.userfilter,
    _id: {
      $ne: req.userData.userId,
    },
  })
    .countDocuments()
    .then((search) => {
      totalItems = search;
      return User.find({
        ...res.locals.userfilter,
        _id: {
          $ne: req.userData.userId,
        },
      })
        .select('-password')
        .sort({ updatedAt: -1 })
        .skip((currentPage - 1) * limit)
        .limit(limit);
    })
    .then((result) => {
      if (!result) {
        const error = new Error('No Users Found');
        error.statusCode = 200;
        throw error;
      } else {
        res.status(200).json({
          users: result,
          totalItems: totalItems,
        });
      }
    })
    .catch((err) => {
      const error = new Error('No Users Found');
      error.statusCode = 400;
      throw error;
    });
};

exports.deleteUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((result) => {
      if (!result) {
        let error = new Error('No Task Found With This ID...');
        error.statusCode = 404;
        throw error;
      }
    })
    .then((status) => {
      User.findByIdAndRemove(req.params.id).then((result) => {
        res.status(200).json({ massage: 'User Deleted Successfully' });
      });
    });
};

exports.changeUserStatus = (req, res, next) => {
  let userId = req.body.id,
    currentStatus = req.body.status;

  User.findById(userId).then((result) => {
    if (!result) {
      const err = new Error('A user with this email could be not found');
      err.StatusCode = 401;
      throw err;
    }
    User.findByIdAndUpdate(userId)
      .then((user) => {
        user.status = currentStatus == 'Active' ? 'In-Active' : 'Active';
        return user.save();
      })
      .then((success) => {
        res.status(200).json({
          user: success,
          massage: 'User Status Changed Successfully',
        });
      });
  });
};
