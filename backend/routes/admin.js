let express = require('express')
let router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')
let passport = require('passport')

/* Handle the Volunteer Registration Form */
router.post('/newVolunteer', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin creating volunteer')
  try {
    // check if a volunteer with the same email already exists
    let existingVolunteer = await db
      .collection('volunteers')
      .findOne({ email: req.body.email })
    if (existingVolunteer) {
      res
        .status(400)
        .json({ message: 'A volunteer with that email already exists' })
      return
    }

    req.body.role = 'volunteer'
    let result = await db.collection('volunteers').insertOne(req.body)
    res
      .status(201)
      .json({ id: result.insertedId, message: 'Volunteer created' })
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

router.get('/volunteers', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin getting volunteer')
  try {
    let query = { role: 'volunteer' } // only get volunteers whose role is 'volunteer'

    if (req.query.email) {
      query.email = { $regex: new RegExp(req.query.email, 'i') }
    }

    let page = parseInt(req.query.page) || 1
    let perPage = parseInt(req.query.perPage) || 10
    let skip = (page - 1) * perPage

    // sort by sort_by query parameter
    // sort before pagination
    let sort = {}
    if (req.query.sort_by) {
      // split the sort_by into an array
      let sortBy = req.query.sort_by.split('.')

      // check if the first element is a valid field
      if (sortBy.length > 1 && ['numTickets'].includes(sortBy[0])) {
        sort[sortBy[0]] = sortBy[1] == 'desc' ? -1 : 1
      }
    }

    let result = await db
      .collection('volunteers')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(perPage)
      .toArray()

    let total = await db.collection('volunteers').countDocuments(query)

    res.json({ volunteers: result, total: total, page: page, perPage: perPage })
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Find events where volunteer is registered */
router.get('/volunteer/events/:id', async function (req, res) {
  console.log('Admin getting events where volunteer is registered')
  const db = await connectToDB()
  try {
    const volunteerId = req.params.id
    let result = await db
      .collection('events')
      .find({ volunteers: volunteerId }) // find events where the volunteer's ID is in the volunteers array
      .toArray()

    res.json({ events: result })
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Handle the Volunteer Edit Form */
router.put('/edit/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin editing volunteer')
  try {
    delete req.body._id // remove _id field from req.body, so we can update
    const id = req.params.id
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

/* Get Volunteer Info */
router.get('/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin getting volunteer info')
  try {
    const id = req.params.id
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
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Get all volunteers for event */
router.get('/events/:eventId/volunteers', async function (req, res) {
  console.log('Get all volunteers for given event')
  const db = await connectToDB()
  try {
    const { eventId } = req.params

    let event = await db.collection('events').findOne(
      { _id: new ObjectId(eventId) } // find the event by its ID
    )

    if (event) {
      // convert volunteer IDs from strings to ObjectIds
      let volunteerIds = event.volunteers.map((id) => new ObjectId(id))

      let page = parseInt(req.query.page) || 1
      let perPage = parseInt(req.query.perPage) || 10
      let skip = (page - 1) * perPage

      // find all volunteers whose IDs are in the volunteers array of the event
      let volunteers = await db
        .collection('volunteers')
        .find({ _id: { $in: volunteerIds } })
        .skip(skip)
        .limit(perPage)
        .toArray()

      let total = await db
        .collection('volunteers')
        .countDocuments({ _id: { $in: volunteerIds } })

      return res.json({ volunteers, total, page, perPage }) // return the volunteers
    } else {
      return res.status(404).json({ message: 'Event not found' })
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* withdraw from event */
router.put(
  '/volunteer/events/:eventId/withdraw/:volunteerId',
  async function (req, res) {
    const db = await connectToDB()
    try {
      const { eventId, volunteerId } = req.params

      // remove the volunteer's ID from the event's volunteers array
      let eventResult = await db
        .collection('events')
        .updateOne(
          { _id: new ObjectId(eventId) },
          { $pull: { volunteers: volunteerId } }
        )

      // remove the event's ID from the volunteer's events array
      let volunteerResult = await db
        .collection('volunteers')
        .updateOne(
          { _id: new ObjectId(volunteerId) },
          { $pull: { events: eventId } }
        )

      if (
        eventResult.modifiedCount === 1 &&
        volunteerResult.modifiedCount === 1
      ) {
        res.json({ message: 'Volunteer successfully withdrawn from the event' })
      } else {
        res
          .status(400)
          .json({ message: 'Failed to withdraw volunteer from the event' })
      }
    } catch (err) {
      if (!res.headersSent) {
        res.status(400).json({ message: err.message })
      }
    } finally {
      await db.client.close()
    }
  }
)

/* Delete Volunteer */
router.delete('/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin deleting volunteer info')

  try {
    const id = req.params.id
    // Remove volunteer from all events
    await db
      .collection('events')
      .updateMany({ volunteers: id }, { $pull: { volunteers: id } })
    // Delete the volunteer
    let result = await db
      .collection('volunteers')
      .deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Deleted successfully' })
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

/* Handle the new Event Form */
router.post('/event', async function (req, res) {
  const db = await connectToDB()
  try {
    req.body.eventQuota = parseInt(req.body.eventQuota)
    // req.body.highlight = req.body.highlight == 'on'
    req.body.createdAt = new Date()
    req.body.modifiedAt = new Date()
    let result = await db.collection('events').insertOne(req.body)
    res.status(201).json({ id: result.insertedId, message: 'Event created' })
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Update a single Event */
router.put('/event/edit/:id', async function (req, res) {
  const db = await connectToDB()
  console.log('Admin updated event')
  try {
    // not expected since we didn't change id
    delete req.body._id // remove _id field from req.body, so we can update
    req.body.eventQuota = parseInt(req.body.eventQuota)
    // req.body.highlight = req.body.highlight == 'on'
    req.body.createdAt = new Date()
    req.body.modifiedAt = new Date()

    let result = await db
      .collection('events')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Event updated' })
    } else {
      res.status(404).json({ message: 'Event not found' })
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

/* Delete a single Event */
router.delete('/event/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    const id = req.params.id
    // Remove event from all volunteers
    await db
      .collection('volunteers')
      .updateMany({ events: id }, { $pull: { events: id } })
    // Delete the event
    let result = await db
      .collection('events')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Event deleted' })
    } else {
      res.status(404).json({ message: 'Event not found' })
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({ message: err.message })
    }
  } finally {
    await db.client.close()
  }
})

module.exports = router
