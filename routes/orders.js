const express = require('express');
const router  = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

module.exports = (db) => {
  router.get('/', function (req, res){
  db.query("SELECT * FROM orders WHERE user_id = $1", [req.cookies.id]).then(data => {
    const orders = data.rows
    console.log(orders);
    const templateVars = {orders : orders}
    res.render('orders', templateVars)
  });

});

router.get("/order_ready", () => {
  client.messages
  .create({
     body: 'Your order is ready for pickup!',
     from: twilioNumber,
     to: '17806992118'
   })
  .then(message => console.log(message.sid));
});
//   db.query(`SELECT items.name, order_items.quantity FROM items JOIN order_items ON order_items.order_id=${req.cookies["order"]} AND order_items.item_id=items.id`)
router.get('/:id', function (req, res){
  db.query("SELECT * FROM orders WHERE user_id = $1 AND id = $2", [req.cookies.id, req.params.id]).then(data => {
    const order = data.rows[0];
    db.query("SELECT * FROM order_items JOIN items ON order_items.item_id = items.id WHERE order_id = $1", [req.params.id]).then(itemsResult => {
      const items = itemsResult.rows;
      db.query(`SELECT * FROM order_items WHERE order_items.order_id=${order.id}`).then(orderItem => {
        const order_items = orderItem.rows;
        const templateVars = {
          order : order,
          items : items,
          order_items: order_items
        };
        res.render('order', templateVars);
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
});

router.post('/', function (req, res){

  let orderId = "";
  // get all data about the order and save it in db, send SMS to user, send SMS to restaurant, res.redirect("/order);
    // set timeout send sms when  time expires to user and update db with status - ready for pick up
    //make array of items using req body use multiple insert queries through array to dump them into order items under the correct order id

    //if (res.cookie["order"]) { get outa here }
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
      db.query(`SELECT items.name FROM items JOIN order_items ON order_items.item_id=items.id AND order_items.order_id=${orderId}`).then(data => {
        let items = data.rows;
        let orderMessage = "New Order: ";
        console.log(values, items);
        for (let i = 0; i < items.length; i++) {
          orderMessage += values[i][2] + "x " + items[i].name + ". ";
        }
        console.log(orderMessage);
        client.messages
        .create({
          body: orderMessage,
          from: twilioNumber,
          to: '17806992118'
        })
        .then(message => console.log(message.sid));
        res.redirect("/api/orders/"+orderId);
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  })
  .catch(err => {
    console.log(err);
    res
      .status(500)
      .json({ error: err.message });
  });
  //res.status(200).send("ok");
});
  return router
};
