const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB_URI
// Use the 'uri' letiable to connect to your MongoDB database
// and perform other operations as needed.

// process.env.MONGODB_URI =
//   'mongodb://ayazhankadessova4:W4e3fKuanHM2v0L1fadPhRQmgYbDX1DoVTsVBeUTg5xm0atgauP92Ns6ONiB4ce7S0XrQGhPosgqACDbCUUPng==@ayazhankadessova4.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@ayazhankadessova4@'

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
