const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get('/', function (req, res){
  db.query("SELECT * FROM orders WHERE user_id = $1", [req.cookies.id]).then(data => {
    const orders = data.rows
    console.log(orders);
    const templateVars = {orders : orders}
    res.render('orders', templateVars)
  });

});

router.get('/:id', function (req, res){
  db.query("SELECT * FROM orders WHERE user_id = $1 AND id = $2", [req.cookies.id, req.params.id]).then(async data => {
    const itemsResult = await db.query("SELECT * FROM order_items JOIN items ON order_items.item_id = items.id WHERE order_id = $1", [req.params.id])
    const items = itemsResult.rows
    console.log(items)
    const order = data.rows[0]
    console.log(order);
    const templateVars = {order : order, items : items}
    res.render('order', templateVars)
  });

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
      //store order ID somewhere on user so you're able to query database to see the order
      //res.cookie["order"] = orderId;
      //show a different screen if order cookie is already set, so user can't place multiple orders
      //redirect to /orders
      res.redirect("/api/orders/"+orderId);
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
  return router
};
