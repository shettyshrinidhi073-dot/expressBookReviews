# ExpressBookReviews

A Node.js and Express REST API for browsing a small book catalogue and managing customer reviews. Customer login uses JSON Web Tokens (JWT).

## Requirements

- Node.js 18 or later
- npm

## Run locally

Open a terminal in this folder and run:

```bash
npm install
npm start
```

The API runs at **http://localhost:5000** by default. To use a different port, set the `PORT` environment variable.

For development with automatic restart:

```bash
npm run dev
```

Check that the server is running:

```
GET http://localhost:5000/health
```

## Public book endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Get all books |
| GET | `/isbn/:isbn` | Get a book by its ID/ISBN key |
| GET | `/author/:author` | Search books by author |
| GET | `/title/:title` | Search books by title |
| GET | `/review/:isbn` | Get reviews for a book |
| POST | `/customer/register` | Register a customer |
| POST | `/customer/login` | Log in and receive a JWT |
| PUT | `/customer/auth/review/:isbn` | Add or update your review |
| DELETE | `/customer/auth/review/:isbn` | Delete your review |

The supplied sample catalogue uses keys 1–10.

## Example authentication flow

1. Register with JSON body `{"username":"vidya","password":"pass123"}` at `POST /customer/register`.
2. Log in with the same JSON body at `POST /customer/login`.
3. Copy the returned token.
4. For protected review requests, send this header:

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

5. Add or update a review using JSON body `{"review":"An enjoyable book."}` at `PUT /customer/auth/review/1`.
6. Delete your own review with `DELETE /customer/auth/review/1`.

## Notes

- Customer accounts and reviews are stored in memory, so they reset when the server restarts.
- The default JWT and session secrets are for local learning only. Set `JWT_SECRET` and `SESSION_SECRET` environment variables before deploying.
- This is an educational project, not a production-ready authentication system.
