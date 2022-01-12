// Client facing scripts here

$( document ).ready(function() {
  console.log( "ready!" );

  //Increase and decrease quantities
  $(".incItem").click(function() {
    let id = $(this).parent().attr("id");
    let quantityEle = $(`#${id} span`);
    let quantity = parseInt(quantityEle.html());
    quantity += 1;
    quantityEle.html(quantity);
  });
  $(".decItem").click(function() {
    let id = $(this).parent().attr("id");
    let quantityEle = $(`#${id} span`);
    let quantity = parseInt(quantityEle.html());
    quantity -= (quantity > 0 ? 1 : 0);
    quantityEle.html(quantity);
  });

  //Place order
  $("#placeOrder").click(function(e) {
    e.preventDefault();
    items = [];
    let itemEles = $(".orderItem");
    for (let item of itemEles) {
      let quantity = parseInt(item.querySelector("span").innerHTML);
      if (quantity > 0)
        items.push({id: item.id, quantity: quantity});
    }
    $("#Item_Id").val(JSON.stringify(items));
    $("#orderForm").submit();
  });

//  const appendOrder = function(users)
});
