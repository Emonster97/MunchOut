/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

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

  //look at this for cookie example, we set it based off the 2nd param
  router.get('/login/:id', function (req, res) {
    res.cookie('id', req.params.id);
    res.redirect("/");
  });

  router.get('/orders', function (req, res){
    //write query to get order details from res.cookie["order"]
    db.query(`SELECT items.name, order_items.quantity FROM items JOIN order_items ON order_items.order_id=${req.cookies["order"]} AND order_items.item_id=items.id`)
    .then(data =>{
      let rows = data.rows;
      res.json({rows});
      res.render('orders', {orders:rows})
    }
      )

    //cookie order is order_id
    //if (!res.cookie["order"]) { res.redirect(main) } //no order placed

  })

 router.post('/', function (req,res) {

 });

  router.post('/orders', function (req, res){

    let orderId = "";
    // get all data about the order and save it in db, send SMS to user, send SMS to restaurant, res.redirect("/order);
      // set timeout send sms when  time expires to user and update db with status - ready for pick up

      //make array of items using req body use multiple insert queries through array to dump them into order items under the correct order id

       if (req.cookies['order']){
          res.redirect('/orders');
        }
    const items = JSON.parse(req.body.Item_Id);
    if (items.length <= 0) {
      res.json({ error: "No items selected!" });
    }
    db.query(`INSERT INTO orders (user_id, status, place_order_time) VALUES ($1, 'Placed Order', $2) RETURNING *`,[Number(req.cookies['id']),Date.now()])
    .then(data => {
      const order = data.rows[0];
      orderId = order.id;



      let values = [];
      for (let item of items) {
        values.push([Number(orderId), Number(item.id), Number(item.quantity)])
      }

      const insertSQL = "INSERT INTO order_items (order_id, item_id, quantity) VALUES %L RETURNING *"
      let format = require("pg-format");
      console.log (format(insertSQL, values));
      db.query(format(insertSQL, values),[]).then(data => {
        db.query(`SELECT items.name FROM items JOIN order_items ON order_items.order_id=${orderId}`).then(data => {
          let items = data.rows;
          //store order ID somewhere on user so you're able to query database to see the order
          res.cookie('order', orderId);
          //clear this cookie when the order is completed
          let orderMessage = "New Order: ";
          for (let i = 0; i < items.length; i++) {
            orderMessage += values[i][2].quantity + "x " + items[i].name + ". ";
          }
          console.log(orderMessage);
          client.messages
          .create({
            body: orderMessage,
            from: twilioNumber,
            to: '17806992118'
          })
          .then(message => console.log(message.sid));
          //show a different screen if order cookie is already set, so user can't place multiple orders
          //redirect to /orders
          res.redirect("/api/users/orders");
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));

      //SELECT * FROM order_items JOIN orders ON order_items.order_id = orders.id;

      //delete res and Insert into order items, the amount of items we ordered, so if someone ordered one hot dog and one hamburger we would do 2 insert queries, we do a for loop for this
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
