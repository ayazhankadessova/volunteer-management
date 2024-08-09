let express = require('express')
let router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')
const { formatDistanceStrict } = require('date-fns')
const { generateToken } = require('../utils/auth')
let passport = require('passport')

router.get('/me', async function (req, res) {
  const db = await connectToDB()
  try {
    console.log('hey')
    // get the volunteer id from req.user
    const id = req.user._id
    let volunteer = await db
      .collection('volunteers')
      .findOne({ _id: new ObjectId(id) })
    if (volunteer) {
      res.status(200).json({ volunteer: volunteer })
    } else {
      res.status(404).json({ message: 'No volunteer found with that id' })
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

router.put('/edit', async function (req, res) {
  const db = await connectToDB()
  try {
    delete req.body._id // remove _id field from req.body, so we can update
    // get the volunteer id from req.user
    const id = req.user._id
    let result = await db
      .collection('volunteers')
      .updateOne({ _id: new ObjectId(id) }, { $set: req.body })
    if (result.matchedCount > 0) {
      res.status(200).json({ message: 'Updated successfully' })
    } else {
      res.status(404).json({ message: 'No volunteer found with that id' })
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message, action: 'Update' })
    }
  } finally {
    await db.client.close()
  }
})

// gete event organizers for the events that you have joined
router.get('/stats/eventOrganizer', async function (req, res) {
  const db = await connectToDB()
  try {
    // get the volunteer id from req.user
    const id = req.user._id

    let result = await db
      .collection('events')
      .aggregate([
        // match events that the user has joined
        { $match: { volunteers: id, eventOrganizer: { $ne: null } } },
        { $group: { _id: '$eventOrganizer', total: { $sum: 1 } } },
      ])
      .toArray()

    res.json(result)
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* get registered events */
router.get('/event', async function (req, res) {
  const db = await connectToDB()
  try {
    // get the volunteer id from req.user
    const id = req.user._id

    // ignore case
    let query = { volunteers: id }
    if (req.query.title) {
      query.eventTitle = { $regex: new RegExp(req.query.title, 'i') }
    }

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
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Join Event */
router.patch('/event/join/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    const event = await db
      .collection('events')
      .findOne({ _id: new ObjectId(req.params.id) })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    const volunteer = req.user._id // replace this with how you get the logged in user's ID
    if (event.volunteers && event.volunteers.includes(volunteer)) {
      return res
        .status(400)
        .json({ message: 'You have already joined this event' })
    }
    if (event.volunteers && event.volunteers.length >= event.eventQuota) {
      return res.status(400).json({ message: 'Event is full' })
    }
    const updateResult = await db
      .collection('events')
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $push: { volunteers: volunteer }, $set: { modifiedAt: new Date() } }
      )
    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ message: 'Failed to join event' })
    }
    const updateVolunteerResult = await db
      .collection('volunteers')
      .updateOne(
        { _id: new ObjectId(volunteer) },
        { $push: { events: req.params.id } }
      )
    if (updateVolunteerResult.modifiedCount === 0) {
      return res.status(500).json({ message: 'Failed to update volunteer' })
    }
    res.status(200).json({ message: 'Successfully joined event' })
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

module.exports = router
