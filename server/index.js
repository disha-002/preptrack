require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { buildTestFromPattern } = require('./testBuilder');
const { getPattern, listPatterns } = require('./patternLoader');
const { registerUser, loginUser } = require('./auth');
const { authenticateToken } = require('./middleware');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'preptrack';

let db;

async function connectDb() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);
  console.log('Connected to MongoDB', uri, 'db:', dbName);
}

function sampleQuestions(docs, count) {
  // Fisher-Yates shuffle and take first count
  const arr = docs.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

// Simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ==================== AUTHENTICATION ENDPOINTS ====================

// POST /api/auth/register - Register new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const userId = await registerUser(db, email, password, name);
    res.status(201).json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await loginUser(db, email, password);
    res.json({
      message: 'Login successful',
      token: user.token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// ==================== PROTECTED ENDPOINTS ====================

// GET /api/patterns -> return all available patterns (PROTECTED)
app.get('/api/patterns', authenticateToken, (req, res) => {
  const patterns = listPatterns();
  res.json(patterns);
});

// POST /api/patterns/:patternId/start -> start a test from a pattern (PROTECTED)
app.post('/api/patterns/:patternId/start', authenticateToken, async (req, res) => {
  const patternId = req.params.patternId;
  const userId = req.user.userId; // Get userId from JWT token

  try {
    // Load the pattern from disk
    const pattern = getPattern(patternId);
    if (!pattern) {
      return res.status(404).json({ error: `Pattern not found: ${patternId}` });
    }

    // Build test using the pattern generator
    const questions = await buildTestFromPattern(db, pattern, pattern.company);

    if (!questions || questions.length === 0) {
      return res.status(500).json({ error: 'Failed to generate test questions' });
    }

    // Create an attempt document
    const attemptsCol = db.collection('attempts');
    const attempt = {
      userId,
      patternId,
      company: pattern.company,
      questions: questions.map(q => ({ questionId: q.id })),
      startedAt: new Date(),
      status: 'in-progress'
    };
    const result = await attemptsCol.insertOne(attempt);

    res.json({
      attemptId: result.insertedId,
      patternId,
      company: pattern.company,
      testName: pattern.name,
      timeLimitSeconds: pattern.timeLimitSeconds,
      totalQuestions: pattern.totalQuestions,
      sections: pattern.sections,
      questions
    });
  } catch (err) {
    console.error('Error starting pattern test:', err);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// GET /api/tests -> return only company-specific test templates
app.get('/api/tests', (req, res) => {
  const templates = [
    { id: 'tcs-mixed', name: 'TCS Mock Test — 15 Qs', categories: ['Aptitude', 'Coding', 'Verbal'], numQuestions: 15, timeLimitSeconds: 45 * 60, company: 'TCS' },
    { id: 'infosys-mixed', name: 'Infosys Mock Test — 12 Qs', categories: ['Aptitude', 'Coding', 'Verbal'], numQuestions: 12, timeLimitSeconds: 40 * 60, company: 'Infosys' },
    { id: 'wipro-mixed', name: 'Wipro Mock Test — 10 Qs', categories: ['Aptitude', 'Coding'], numQuestions: 10, timeLimitSeconds: 30 * 60, company: 'Wipro' },
    { id: 'cognizant-mixed', name: 'Cognizant GenC Test — 12 Qs', categories: ['Aptitude', 'Coding', 'Verbal'], numQuestions: 12, timeLimitSeconds: 35 * 60, company: 'Cognizant' },
    { id: 'accenture-mixed', name: 'Accenture Assessment — 14 Qs', categories: ['Aptitude', 'Coding', 'Verbal'], numQuestions: 14, timeLimitSeconds: 40 * 60, company: 'Accenture' },
    { id: 'ibm-mixed', name: 'IBM Placement Test — 10 Qs', categories: ['Aptitude', 'Coding'], numQuestions: 10, timeLimitSeconds: 30 * 60, company: 'IBM' }
  ];
  res.json(templates);
});

// POST /api/tests/:id/start -> returns randomized question set and attemptId
app.post('/api/tests/:id/start', async (req, res) => {
  const testId = req.params.id;
  const { numQuestions } = req.body; // optional override
  
  try {
    // Get test template definition - only company-specific tests
    const testTemplates = {
      'tcs-mixed': { categories: ['Aptitude', 'Coding', 'Verbal'], defaultQuestions: 15, company: 'TCS' },
      'infosys-mixed': { categories: ['Aptitude', 'Coding', 'Verbal'], defaultQuestions: 12, company: 'Infosys' },
      'wipro-mixed': { categories: ['Aptitude', 'Coding'], defaultQuestions: 10, company: 'Wipro' },
      'cognizant-mixed': { categories: ['Aptitude', 'Coding', 'Verbal'], defaultQuestions: 12, company: 'Cognizant' },
      'accenture-mixed': { categories: ['Aptitude', 'Coding', 'Verbal'], defaultQuestions: 14, company: 'Accenture' },
      'ibm-mixed': { categories: ['Aptitude', 'Coding'], defaultQuestions: 10, company: 'IBM' }
    };
    
    const template = testTemplates[testId];
    if (!template) {
      return res.status(404).json({ error: 'Test template not found' });
    }
    
    // Build the filter for questions - all our tests are company-specific now
    let questionFilter = {};
    
    // Filter by company (all our templates have companies)
    if (template.company) {
      questionFilter.company = template.company;
    } else {
      // Fallback for any non-company tests (shouldn't happen now)
      questionFilter = {
        $or: template.categories.map(cat => ({ category: cat }))
      };
    }
    
    // Get available questions for this test template
    const qCol = db.collection('questions');
    const count = parseInt(numQuestions, 10) || template.defaultQuestions;
    const allQuestions = await qCol.find(questionFilter).toArray();
    
    if (!allQuestions || allQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this test type' });
    }
    
    const selected = sampleQuestions(allQuestions, Math.min(count, allQuestions.length));
    
    // remove correctAnswer and explanation when sending to client
    const clientQuestions = selected.map(q => ({
      id: q._id,
      text: q.text,
      choices: q.choices,
      category: q.category,
      difficulty: q.difficulty,
      tags: q.tags,
      company: q.company // include company info for display
    }));

    // create an attempt document with status 'in-progress'
    const attemptsCol = db.collection('attempts');
    const attempt = {
      userId: req.body.userId || null,
      testId,
      questions: clientQuestions.map(q => ({ questionId: q.id })),
      startedAt: new Date(),
      status: 'in-progress'
    };
    const result = await attemptsCol.insertOne(attempt);

    res.json({ attemptId: result.insertedId, questions: clientQuestions });
  } catch (err) {
    console.error('start test error', err);
    res.status(500).json({ error: 'failed to start test' });
  }
});

// POST /api/attempts/:attemptId/submit -> compute score and store attempt
app.post('/api/attempts/:attemptId/submit', async (req, res) => {
  const attemptId = req.params.attemptId;
  const responses = req.body.responses || []; // [{ questionId, selected }]
  
  console.log('SUBMIT ATTEMPT:', attemptId);
  console.log('RESPONSES:', responses.length, 'responses');
  
  try {
    const qCol = db.collection('questions');
    // fetch all question docs for provided ids
    const ids = responses.map(r => {
      try { return new ObjectId(r.questionId); } catch (e) { return r.questionId; }
    });
    const docs = await qCol.find({ _id: { $in: ids } }).toArray();
    const answersMap = new Map();
    docs.forEach(d => answersMap.set(String(d._id), d.correctAnswer));

    let correct = 0;
    const detailed = responses.map(r => {
      const qid = String(r.questionId);
      const expected = answersMap.get(qid);
      const isCorrect = expected !== undefined && expected === r.selected;
      if (isCorrect) correct++;
      return { questionId: r.questionId, selected: r.selected, correct: isCorrect };
    });

    const score = responses.length ? Math.round((correct / responses.length) * 100) : 0;

    const attemptsCol = db.collection('attempts');
    const update = {
      $set: {
        responses: detailed,
        score,
        accuracy: responses.length ? correct / responses.length : 0,
        submittedAt: new Date(),
        status: 'submitted'
      }
    };
    const updateResult = await attemptsCol.updateOne({ _id: new ObjectId(attemptId) }, update);
    console.log('UPDATE RESULT:', updateResult.modifiedCount, 'documents modified');

    // Verify the update worked
    const savedAttempt = await attemptsCol.findOne({ _id: new ObjectId(attemptId) });
    console.log('SAVED ATTEMPT STATUS:', savedAttempt?.status, 'USER:', savedAttempt?.userId);

    console.log('ATTEMPT SAVED - Score:', score, 'Correct:', correct, 'Total:', responses.length);

    res.json({ score, correct, total: responses.length, accuracy: responses.length ? correct / responses.length : 0 });
  } catch (err) {
    console.error('submit error', err);
    res.status(500).json({ error: 'failed to submit attempt' });
  }
});

// GET /api/users/:userId/attempts -> get all past test attempts for a user (PROTECTED)
app.get('/api/users/:userId/attempts', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  const requestingUserId = req.user.userId; // Get userId from JWT token

  console.log('Fetching attempts for userId:', userId, 'Requesting user:', requestingUserId);

  // Only allow users to view their own attempts
  if (String(userId) !== String(requestingUserId)) {
    console.log('Unauthorized access attempt');
    return res.status(403).json({ error: 'Unauthorized: cannot view other user\'s attempts' });
  }

  try {
    // Convert userId to ObjectId safely
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (e) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const attemptsCol = db.collection('attempts');
    
    console.log('QUERY: looking for userId:', userObjectId, 'status: submitted');
    
    const attempts = await attemptsCol
      .find({ userId: userObjectId, status: 'submitted' })
      .sort({ submittedAt: -1 })
      .toArray();

    console.log('Found attempts:', attempts.length);
    
    // If no results, try with userId as string (in case it was stored as string)
    if (attempts.length === 0) {
      console.log('No results with ObjectId, trying with string userId:', userId);
      const attemptsAsString = await attemptsCol
        .find({ userId: userId, status: 'submitted' })
        .sort({ submittedAt: -1 })
        .toArray();
      
      console.log('Found with string userId:', attemptsAsString.length);
      
      if (attemptsAsString.length > 0) {
        console.log('WARNING: userId was stored as string, not ObjectId!');
        return res.json(attemptsAsString.map(attempt => ({
          attemptId: attempt._id,
          company: attempt.company,
          patternId: attempt.patternId,
          score: attempt.score,
          accuracy: attempt.accuracy,
          correct: attempt.responses ? attempt.responses.filter(r => r.correct).length : 0,
          total: attempt.responses ? attempt.responses.length : 0,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          timeSpent: attempt.submittedAt && attempt.startedAt 
            ? Math.round((attempt.submittedAt - attempt.startedAt) / 1000) 
            : 0
        })));
      }
    }

    // Format attempts for frontend
    const formattedAttempts = attempts.map(attempt => ({
      attemptId: attempt._id,
      company: attempt.company,
      patternId: attempt.patternId,
      score: attempt.score,
      accuracy: attempt.accuracy,
      correct: attempt.responses ? attempt.responses.filter(r => r.correct).length : 0,
      total: attempt.responses ? attempt.responses.length : 0,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      timeSpent: attempt.submittedAt && attempt.startedAt 
        ? Math.round((attempt.submittedAt - attempt.startedAt) / 1000) 
        : 0
    }));

    res.json(formattedAttempts);
  } catch (err) {
    console.error('Error fetching attempts:', err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Start server after DB connect
connectDb().then(() => {
  app.listen(port, () => console.log(`PrepTrack server listening on ${port}`));
}).catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});
