var express = require('express')
var router = express.Router()
const { connectToDB, ObjectId } = require('../utils/db')

/* Show Become Volunteer form */
router.get('/volunteer', async function (req, res) {
  res.status(200).render('newVolunteer')
})

/* Handle the Volunteer Registration Form */
router.post('/volunteer', async function (req, res) {
  const db = await connectToDB()
  try {
    let result = await db.collection('volunteers').insertOne(req.body)
    res
      .status(201)
      .render('actionComplete', { id: result.insertedId, action: 'Created!' })
  } catch (err) {
    res.status(400).render('error', { message: err.message, status: 400 })
  } finally {
    await db.client.close()
  }
})

module.exports = router
