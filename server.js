// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect()
.then (()=>
console.log("connected"));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

//cookie parser init
let cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const ordersRoutes = require("./routes/orders");
// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/orders", ordersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {

  //if they dont have an id on cookie then set = 1, only works because one user
  if (!req.cookies.id) {
    res.cookie('id', 1);
  }
  if (req.cookies['order']){
    res.redirect('/orders');
  }
  //when testing the app delete the orders database, otherwise after we place
  //if we have an order cookie, redirect to /orders instead ?, design choice
  //otherwise, query items and show index:

  // queries database for all items (and returns a promise, must wait to resolve before using data)
  db.query('SELECT * FROM items;')
    // data is returned from promise (db.query)
    .then(data => {
      // if succesful, renders index.ejs along with template variable object items
      // which contains returned data.rows


      return res.render("index", {
        items: data.rows
      });
    })
    .catch(error => console.log(error));
});

app.get("/items", (req, res) => {
  res.render("items");
});

app.get("/orders", (req, res) => {
  res.render("orders");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
