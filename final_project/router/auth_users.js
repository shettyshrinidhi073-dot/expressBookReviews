const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fingerprint_customer';

// This in-memory list is reset whenever the server restarts.
const users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user =>
    user.username === username && user.password === password
  );
};

// Register a new customer.
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const cleanUsername = username.trim();
  if (isValid(cleanUsername)) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  users.push({ username: cleanUsername, password });
  return res.status(201).json({ message: 'User successfully registered.' });
});

// Log in and receive a JWT. Send it as: Authorization: Bearer <token>.
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(200).json({ message: 'Login successful.', token });
});

// Add or update the logged-in customer's review for a book.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session && req.session.username;
  if (!username) {
    return res.status(401).json({ message: 'Please log in first.' });
  }

  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const review = req.body && req.body.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'A non-empty review is required.' });
  }

  book.reviews[username] = review.trim();
  return res.status(200).json({
    message: 'Review added successfully.',
    reviews: book.reviews
  });
});

// Delete only the logged-in customer's review for a book.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session && req.session.username;
  if (!username) {
    return res.status(401).json({ message: 'Please log in first.' });
  }

  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: 'You have not reviewed this book.' });
  }

  delete book.reviews[username];
  return res.status(200).json({
    message: 'Your review was deleted successfully.',
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
