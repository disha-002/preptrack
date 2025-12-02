const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'preptrack';
  const seedPath = path.join(__dirname, '..', 'seed', 'questions_seed.json');

  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found:', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf8');
  let docs;
  try {
    docs = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON seed file:', err);
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('questions');

    // Clear existing questions (confirm for dev seeding)
    const del = await col.deleteMany({});
    console.log(`Deleted ${del.deletedCount} existing questions (if any).`);

    const res = await col.insertMany(docs);
    console.log(`Inserted ${res.insertedCount} documents into ${dbName}.questions`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
