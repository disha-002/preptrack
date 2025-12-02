const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT token
function generateToken(userId, email, secret = process.env.JWT_SECRET || 'preptrack-secret-key-change-in-production') {
  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: '7d' }
  );
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Verify JWT token
function verifyToken(token, secret = process.env.JWT_SECRET || 'preptrack-secret-key-change-in-production') {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Register user
async function registerUser(db, email, password, name) {
  const usersCollection = db.collection('users');

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const result = await usersCollection.insertOne({
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return result.insertedId;
}

// Login user
async function loginUser(db, email, password) {
  const usersCollection = db.collection('users');

  // Find user
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id, user.email);

  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    token
  };
}

module.exports = {
  generateToken,
  hashPassword,
  verifyPassword,
  verifyToken,
  registerUser,
  loginUser
};
