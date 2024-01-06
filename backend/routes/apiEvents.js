var express = require('express')
var router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')
const { formatDistanceStrict } = require('date-fns')
var passport = require('passport')

const { generateToken, isVolunteer } = require('../utils/auth')

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

    res.json({
      highlightedEvents: highlightedEvents,
      recentEvents: recentEvents,
      dateFns: formatDistanceStrict,
    })
  } catch (err) {
    console.log('error')
    res.status(400).json({ message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

/* Events Home Page using pagination */
router.get('/event', async function (req, res) {
  const db = await connectToDB()
  try {
    // ignore case
    let query = {}
    if (req.query.title) {
      query.eventTitle = { $regex: new RegExp(req.query.title, 'i') }
    }
    // if (req.query.eventQuota) {
    //   query.eventQuota = parseInt(req.query.eventQuota)
    // }
    let page = parseInt(req.query.page) || 1
    let perPage = parseInt(req.query.perPage) || 6
    let skip = (page - 1) * perPage

    // Create index
    await db.collection('events').createIndex({ createdAt: -1 })

    // Sort and retrieve documents
    let result = await db
      .collection('events')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray()

    // Count total documents
    let total = await db.collection('events').countDocuments(query)

    const totalPages = Math.ceil(total / perPage)

    res.json({
      events: result,
      total: total,
      page: page,
      perPage: perPage,
      totalPages: totalPages,
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

/* Display Details of the Single Event */
router.get('/event/detail/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .findOne({ _id: new ObjectId(req.params.id) })

    if (result) {
      res.status(200).json({ event: result })
    } else {
      res.status(404).json({ message: 'Event not found', status: 404 })
    }
  } catch (err) {
    res.status(400).json({ message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

/* Handle the Volunteer Registration Form */
router.post('/become/volunteer/', async function (req, res) {
  const db = await connectToDB()
  try {
    req.body.role = 'volunteer'
    let result = await db.collection('volunteers').insertOne(req.body)
    res
      .status(201)
      .json({ id: result.insertedId, message: 'Volunteer Created' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

module.exports = router
