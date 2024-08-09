const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB_URI

if (!process.env.MONGODB_URI) {
  // throw new Error('Please define the MONGODB_URI environment letiable inside .env.local');
  process.env.MONGODB_URI = 'mongodb://localhost:27017'
}

// Connect to MongoDB
async function connectToDB() {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db('eventDB')
  db.client = client
  return db
}

module.exports = { connectToDB, ObjectId }
