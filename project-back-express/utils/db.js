const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb://lab4-23501154:nuPHOOVik77QfHAD1Hp07sqICtHiJ9fDYbzMRzC9SmLyJgdwyESda6TmRcDIN5zJKjUMUCViw2siACDbSSJH4w==@lab4-23501154.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@lab4-23501154@';

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('HW1-Collection');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };