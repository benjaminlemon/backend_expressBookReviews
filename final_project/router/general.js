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
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      let availableBookArray = [];
      for (const book in books) {
        availableBookArray.push(books[book]["title"]);
      }
      resolve(availableBookArray);
    } else {
      reject("No books are available!");
    }
  })
    .then((availableBooks) => {
      res
        .status(200)
        .send(
          `Available Books:` + `\n` + JSON.stringify(availableBooks, null, 10)
        );
    })
    .catch((errMessage) => res.status(404).json({ message: errMessage }));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  return new Promise((resolve, reject) => {
    const isbn = parseInt(req.params.isbn);

    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(`Could not find book with ISBN:${isbn}`);
    }
  })
    .then((requestedBook) => {
      res.status(200).send(JSON.stringify(requestedBook, null, 4));
    })
    .catch((errMessage) => {
      res.status(404).json({ message: errMessage });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  return new Promise((resolve, reject) => {
    const requestedAuthor = req.params.author;
    let booksByRequestedAuthor = [];

    for (const book in books) {
      if (books[book]["author"] === requestedAuthor) {
        booksByRequestedAuthor.push(books[book]);
      }
    }
    if (booksByRequestedAuthor.length > 0) {
      resolve(booksByRequestedAuthor);
    } else {
      reject(`Book by ${requestedAuthor} not found! Check author.`);
    }
  })
    .then((requestedBookByAuthor) => {
      res.status(200).send(JSON.stringify(requestedBookByAuthor, null, 4));
    })
    .catch((errMessage) => {
      res.status(404).json({ message: errMessage });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  return new Promise((resolve, reject) => {
    const requestedTitle = req.params.title;
    for (const book in books) {
      if (books[book]["title"] === requestedTitle) {
        resolve(books[book]);
      }
    }
    reject(`${requestedTitle} not found. Please check spelling!`);
  })
    .then((requestedBookByTitle) => {
      res.status(200).send(JSON.stringify(requestedBookByTitle, null, 4));
    })
    .catch((errMessage) => {
      res.status(404).json({ message: errMessage });
    });
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
