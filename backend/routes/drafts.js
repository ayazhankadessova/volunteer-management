/* Handle the new Event Form - NOW AUTH REQ */
router.post('/event', async function (req, res) {
  const db = await connectToDB()
  try {
    req.body.eventQuota = parseInt(req.body.eventQuota)
    // req.body.highlight = req.body.highlight == 'on'
    req.body.createdAt = new Date()
    req.body.modifiedAt = new Date()
    let result = await db.collection('events').insertOne(req.body)
    res.status(201).json({ id: result.insertedId })
  } catch (err) {
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

// Update a single Event NOW AUTH REQ
router.put('/event/edit/:id', async function (req, res) {
  const db = await connectToDB()
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
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

/* Display the Event Edit Form -> NOW AUTH REQ */
router.get('/event/edit/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .findOne({ _id: new ObjectId(req.params.id) })
    if (result) {
      // todo: check status
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

// Delete a single Event -> NOW AUTH REQ
router.delete('/event/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db
      .collection('events')
      .deleteOne({ _id: new ObjectId(req.params.id) })

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Event deleted' })
    } else {
      res.status(404).json({ message: 'Event not found' })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

// NOW AUTH REQ
router.get('/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
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
    res.status(500).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

// Delete Volunteer -> NOW AUTH REQ
router.delete('/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
  try {
    const id = req.params.id
    let result = await db
      .collection('volunteers')
      .deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Deleted successfully' })
    } else {
      res.status(404).json({ message: 'No volunteer found with that id' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})

/* Handle the Volunteer Edit Form  -> NOW AUTH REQ*/
router.put('/edit/volunteer/:id', async function (req, res) {
  const db = await connectToDB()
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
    res.status(400).json({ message: err.message, action: 'Update' })
  } finally {
    await db.client.close()
  }
})

// NOW AUTH REQ
router.get('/volunteers', async function (req, res) {
  const db = await connectToDB()
  try {
    let query = {}
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
    res.status(400).json({ message: err.message })
  } finally {
    await db.client.close()
  }
})
