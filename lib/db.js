/* eslint-disable @typescript-eslint/no-require-imports */
// db.js (at project root)
const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = client.db(process.env.DB_NAME);
  console.log('Connected to MongoDB Atlas');
  return cachedDb;
}

export default connectToDatabase;