const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function seedCompanyQuestions() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'preptrack';
  
  // Read both question files
  const genericPath = path.join(__dirname, '..', 'seed', 'questions_seed.json');
  const companyPath = path.join(__dirname, '..', 'seed', 'company_questions.json');

  if (!fs.existsSync(genericPath) || !fs.existsSync(companyPath)) {
    console.error('Question files not found');
    process.exit(1);
  }

  const genericQuestions = JSON.parse(fs.readFileSync(genericPath, 'utf8'));
  const companyQuestions = JSON.parse(fs.readFileSync(companyPath, 'utf8'));
  
  // Combine all questions
  const allQuestions = [...genericQuestions, ...companyQuestions];

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('questions');

    // Clear existing questions
    const del = await col.deleteMany({});
    console.log(`Deleted ${del.deletedCount} existing questions.`);

    // Insert all questions
    const res = await col.insertMany(allQuestions);
    console.log(`Inserted ${res.insertedCount} questions into ${dbName}.questions`);
    
    // Show breakdown by company
    const companies = [...new Set(companyQuestions.map(q => q.company))];
    console.log(`\nCompany-specific questions added:`);
    for (const company of companies) {
      const count = companyQuestions.filter(q => q.company === company).length;
      console.log(`  ${company}: ${count} questions`);
    }
    console.log(`  Generic/Practice: ${genericQuestions.length} questions`);
    console.log(`  Total: ${allQuestions.length} questions`);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedCompanyQuestions();