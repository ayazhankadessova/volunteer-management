let express = require('express')
let router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')

/* Events Home Page using pagination */
router.get('/', async function (req, res) {
  const db = await connectToDB()
  try {
    let page = parseInt(req.query.page) || 1
    let perPage = parseInt(req.query.perPage) || 6
    let skip = (page - 1) * perPage

    // Create index
    await db.collection('events').createIndex({ createdAt: -1 })

    // Sort and retrieve documents
    let result = await db
      .collection('events')
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray()

    // Count total documents
    let total = await db.collection('events').countDocuments()

    const totalPages = Math.ceil(total / perPage)

    res.status(200).render('paginate', {
      events: result,
      total: total,
      page: page,
      perPage: perPage,
      totalPages: totalPages,
    })
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

/* Create new Event form */
router.get('/new', async function (req, res) {
  res.status(200).render('newEvent')
})

/* Handle the new Event Form */
router.post('/new', async function (req, res) {
  const db = await connectToDB()
  try {
    req.body.highlight = req.body.highlight == 'on'
    req.body.createdAt = new Date()
    req.body.modifiedAt = new Date()
    req.body.eventQuota = parseInt(req.body.eventQuota)
    let result = await db.collection('events').insertOne(req.body)
    // res.status(201).json({ id: result.insertedId })

    res.status(200).render('actionComplete', {
      id: result.insertedId,
      action: 'Event Created',
    })
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
    // res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

/* Display Details of the Single Event */
router.get('/detail/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .findOne({ _id: new ObjectId(req.params.id) })
    if (result) {
      res.status(200).render('eventDetails', { event: result })
    } else {
      res
        .status(404)
        .render('error', { message: 'Event not found', status: 404 })
    }
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

/* Display the Event Edit Form */
router.get('/edit/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .findOne({ _id: new ObjectId(req.params.id) })
    if (result) {
      res.render('updateEvent', { event: result })
    } else {
      res
        .status(404)
        .render('error', { message: 'Event not found', status: 404 })
    }
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

/* Handle the Edit Event Form */
router.post('/edit/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    req.body.eventQuota = parseInt(req.body.eventQuota)
    req.body.highlight = req.body.highlight == 'on'
    let result = await db
      .collection('events')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })

    if (result.modifiedCount > 0) {
      res.status(200).render('actionComplete', {
        id: req.params.id,
        action: 'Event updated',
      })
    } else {
      res.status(200).render('error', {
        message: 'Everything is ok, but No updates made',
        status: 200,
      })
    }
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

// Delete a single Booking
router.post('/delete/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .deleteOne({ _id: new ObjectId(req.params.id) })
    if (result.deletedCount > 0) {
      res
        .status(201)
        .render('actionComplete', { id: result.insertedId, action: 'Deleted!' })
    } else {
      res
        .status(404)
        .render('error', { message: 'Event not found', status: 404 })
    }
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

module.exports = router
