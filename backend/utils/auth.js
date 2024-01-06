const jwt = require('jsonwebtoken')

// generate a token
const generateToken = function (user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, {
    expiresIn: 86400, // expires in 24 hours
  })
}

const isAdmin = function (req, res, next) {
  // extra checking
  if (req.user.role != 'admin') {
    res.status(401).send('Unauthorized: Invalid role')
  }

  next()
}

const isVolunteer = function (req, res, next) {
  // extra checking
  if (req.user.role != 'volunteer') {
    res.status(401).send('Unauthorized: Invalid role')
  }

  next()
}

module.exports = { generateToken, isVolunteer, isAdmin }
