var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const { isAdmin, isVolunteer } = require('./utils/auth')

process.env.TOKEN_SECRET = 'secret'

var jwt = require('jsonwebtoken')
var passport = require('passport')
var BearerStrategy = require('passport-http-bearer').Strategy
// extract toke out of the request
// the verify it with jwt
// if verify -> done + decoded data
passport.use(
  new BearerStrategy(function (token, done) {
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return done(err)
      }
      return done(null, decoded, { scope: 'all' })
    })
  })
)

var indexRouter = require('./routes/index')
var eventRouter = require('./routes/event')
var apiEventRouter = require('./routes/apiEvents')
var becomeRouter = require('./routes/become')
var volunteersRouter = require('./routes/volunteers')
var adminRouter = require('./routes/admin')

process.env.TOKEN_SECRET = 'secret'

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('json spaces', 2)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const dateFns = require('date-fns')

app.use((req, res, next) => {
  res.locals.dateFns = dateFns
  next()
})

app.use('/', indexRouter)
app.use('/event', eventRouter) // ejs based
app.use(
  '/api/volunteer',
  passport.authenticate('bearer', { session: false }),
  isVolunteer,
  volunteersRouter
)
app.use(
  '/api/admin',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  adminRouter
)
app.use('/api', apiEventRouter) 

// app.use('/api', apiEventRouter)
app.use('/become', becomeRouter) 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
