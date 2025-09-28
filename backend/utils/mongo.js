const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer-assistant';

let cached = global._mongo;

if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(m => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectMongo;
