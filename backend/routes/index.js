let express = require('express')
let router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')
const { formatDistanceStrict } = require('date-fns')
const { generateToken } = require('../utils/auth')
let passport = require('passport')

router.post('/api/login', async function (req, res, next) {
  const db = await connectToDB()
  try {
    // check if the user exists
    let user = await db
      .collection('volunteers')
      .findOne({ email: req.body.email })
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }

    if (user.password !== req.body.password) {
      res.status(401).json({ message: 'Incorrect password' })
      return
    }

    // res.json(user)
    // res.json(user);

    // TODO: CHECK PASSWORD match
    delete user.password
    // delete user.ip_address

    // generate a JWT token
    const token = generateToken(user)

    // return the token
    res.json({ token: token })
  } catch (err) {
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

// Define the getRoles endpoint
router.get(
  '/api/getRoles',
  passport.authenticate('bearer', { session: false }),
  function (req, res) {
    console.log('here')
    try {
      // Extract the user's role from the decoded token returned by the Bearer strategy
      const userRole = req.user.role

      // Return the user's role as the response
      res.status(200).json({ role: userRole })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }
)

/* Main Home Page. */

router.get('/', async function (req, res) {
  const db = await connectToDB()
  try {
    let results = await db.collection('events').find().toArray()

    // Get Three Most Recent Highlighted Events
    const highlightedEvents = results
      .filter((event) => event.highlight === true)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)

    // Get Three Most Recent Events
    const recentEvents = results
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)

    res.render('index', {
      highlightedEvents: highlightedEvents,
      recentEvents: recentEvents,
      dateFns: formatDistanceStrict,
    })
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

module.exports = router
