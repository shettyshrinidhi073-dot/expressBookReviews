const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fingerprint_customer';

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep a session for each customer and use a JWT to authenticate protected routes.
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'development_session_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use('/customer/auth', (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'A Bearer token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.session.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ExpressBookReviews API is running.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`ExpressBookReviews API is running at http://localhost:${PORT}`);
});
