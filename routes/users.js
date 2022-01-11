/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get('/login/:id', function (req, res) {
    res.cookie('id', req.params.id);
    res.redirect("/");
  });

  router.get('/order', function (req, res){

  })

  router.post('/order', function (req, res){
    // get all data about the order and save it in db, send SMS to user, send SMS to restaurant, res.redirect("/order);
      // set timeout send sms when  time expires to user and update db with status - ready for pick up

      //make array of items using req body use multiple insert queries through array to dump them into order items under the correct order id


    db.query(`INSERT INTO orders (user_id, status, place_order_time) VALUES (${Number(req.cookies['id'])}, 'Placed Order', ${Date.now()}) RETURNING *`)
    .then(data => {
      const order_id = data;
      //delete res and Insert into order items, the amount of items we ordered, so if someone ordered one hot dog and one hamburger we would do 2 insert queries, we do a for loop for this
      res.json({ order_id });
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: err.message });
    });
    //res.status(200).send("ok");
  });

  return router;
};
//.rows[0].id


//`INSERT INTO orders (user_id, status) VALUES [[${Number(req.cookies['id'])}, 'Placed Order', ${new Date().toISOString().slice(0, 19).replace('T', ' ')}]]`
