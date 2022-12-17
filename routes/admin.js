const express = require('express');
const tasksControllers = require('../controller/admin');
const tasksFilter = require('../controller/admin-filter');
const isAuth = require('../middlware/is-auth');
const route = express.Router();
const { body } = require('express-validator');

route.get('/all-tasks', isAuth, tasksFilter.filter, tasksControllers.getTasks);
route.get(
  '/user-tasks/:id',
  isAuth,
  tasksFilter.filter,
  tasksControllers.getUserTasks
);
route.post(
  '/add-task',
  isAuth,
  body('title').trim().isLength({ max: 255, min: 5 }),
  tasksControllers.createTask
);
route.put(
  '/edit-task/:id',
  isAuth,
  body('title').trim().isLength({ max: 255, min: 5 }),
  tasksControllers.editTask
);
route.delete('/delete-task/:id', isAuth, tasksControllers.deleteTask);
route.get('/task/:id', isAuth, tasksControllers.taskDetails);
route.put('/complete', isAuth, tasksControllers.completeTask);

module.exports = route;
