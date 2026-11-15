const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user =>
    user.username === username && user.password === password
  );
};

// Registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
  return res.status(200).json({ message: "Login successful.", token });
});

// Add or update a review (login required)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session && req.session.username;
  if (!username) {
    return res.status(401).json({ message: "Please log in first." });
  }
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found." });
  const review = req.body.review;
  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({ message: "A review is required." });
  }
  book.reviews[username] = review.trim();
  return res.status(200).json({ message: "Review added successfully.", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
