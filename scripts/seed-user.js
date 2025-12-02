const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'preptrack';

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existing = await usersCollection.findOne({ email: 'disha@example.com' });
    if (existing) {
      console.log('Demo user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create demo user
    const result = await usersCollection.insertOne({
      email: 'disha@example.com',
      password: hashedPassword,
      name: 'Disha',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Demo user created:', result.insertedId);
    console.log('Email: disha@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await client.close();
  }
}

seedUser();
