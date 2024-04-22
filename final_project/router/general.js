const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({
    message:
      "Unable to register user. Ensure username and password are entered!",
  });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);

  return res.status(200).send(JSON.stringify(books[isbn], null, 4));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const requestedAuthor = req.params.author;
  let requestedBookByAuthor = [];

  for (const entry in books) {
    if (books[entry]["author"] === requestedAuthor) {
      requestedBookByAuthor.push(books[entry]);
    }
  }

  return res.send(JSON.stringify(requestedBookByAuthor, null, 4));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const requestedTitle = req.params.title;
  let requestedBookByTitle;

  for (const entry in books) {
    if (books[entry]["title"] === requestedTitle) {
      requestedBookByTitle = books[entry];
    }
  }

  return res.send(JSON.stringify(requestedBookByTitle, null, 4));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn);

  const reviews = books[isbn]["reviews"];
  return res
    .status(200)
    .send(books[isbn]["title"] + "\n" + JSON.stringify(reviews, null, 4));
});

module.exports.general = public_users;
