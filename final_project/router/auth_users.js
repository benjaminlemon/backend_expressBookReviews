const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  if (validUsers.length) {
    return true;
  }

  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Error logging in! Check username and password!" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res
      .status(200)
      .send("User successfully logged in! Session will expire in 60 minutes");
  } else {
    return res
      .status(200)
      .json({ message: "Invalid Login! Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    books[isbn]["reviews"][username] = review;
    console.log(books[isbn]);
    return res
      .status(200)
      .send(
        JSON.stringify(books[isbn]["title"]) +
          "\n" +
          JSON.stringify(books[isbn]["reviews"], null, 4) +
          "\n" +
          "Review successfully added!"
      );
  } else {
    return res.json({ message: "Book does not exist" });
  }
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]["reviews"][username]) {
    delete books[isbn]["reviews"][username];
    return res
      .status(200)
      .send(
        `${username}'s review deleted!` +
          "\n" +
          JSON.stringify(books[isbn], null, 4)
      );
  } else {
    return res
      .status(200)
      .json({
        message: `${username}'s review does not exist for specified book!`,
      });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
