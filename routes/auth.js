const express = require('express')
const route = express.Router()
const {body} = require('express-validator')
const User = require('../models/users')
const authControllers = require('../controller/auth')
const isAuth = require('../middlware/is-auth')
const usersFilter = require('../controller/users-filter')

route.post('/login' , 
            body('email').trim().isEmail().withMessage("Please Enter Valid Email").normalizeEmail(),
            body("password").trim().isLength({min:3}) , 
            authControllers.login            
     )

route.post('/createAccount' , 
      body('email').trim().isEmail().withMessage("Please Enter Valid Email").normalizeEmail(),
      body("password").trim().isLength({min:3}) , 
      authControllers.register            
 )

 route.get('/users' , isAuth , usersFilter.userfilter ,  authControllers.getUsers    )
 route.put('/user-status' , isAuth , authControllers.changeUserStatus    )
 route.delete('/user/:id' , isAuth , authControllers.deleteUser    )
 
module.exports = route