const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let decodeToken;
  if (!req.get('Authorization')) {
    const error = new Error('Not Authenticated..');
    error.statusCode = 401;
    throw error;
  }
  const token = req.get('Authorization').split(' ')[1];

  try {
    decodeToken = jwt.verify(token, 'MohamedYossryFaxil');
    req['userData'] = decodeToken;
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodeToken) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }

  next();
};
