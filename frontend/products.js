$(document).ready(function(e) { 
    save_productslist();
 });


 function save_productslist(){
    $.ajax({
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if(typeof res.posted == 'undefined' && res.posted == false){
                alert("Error Fetching Products");
                return;
            }
            localStorage.setItem('products', JSON.stringify(res));
            var products = JSON.parse(JSON.stringify(res));
            render_products(products);
            add_event_listner_cart();

        },
        error: function (err) {
            alert("Error Fetching Data");
        },
        processData: false,
        type: 'GET',
        url: '/api/getProduct'
      })
 }

 function render_products(products){

    //Pre-process data
    for(var i = 0; i < products.length; i++){
        products[i]['class'] = (i == 0) ? 'carousel-item active' : 'carousel-item';
    }

    $("#template").hide();
    template = $('#template').val();
    html = Mustache.render(template, products);
    $('#result').html(html);
 }

 function search(productId, products){
    for (var i=0; i < products.length; i++) {
        if (products[i].productId === productId) {
            return products[i];
        }
    }
}

function add_event_listner_cart(){
    $("[class*=add-cart]").click(function(event) {
        var productId = event.target.id;
        var amount = $(`#${productId}-amount`).val();
        add_to_cart(amount, productId);
    });
}

 function add_to_cart(amount, productId){
     if(typeof productId == 'undefined' || typeof amount == 'undefined' || !productId || !amount){
         return;
     }
     let products = JSON.parse(localStorage.getItem('products'));
     let product = search(productId, products);
     if(product.quantity - amount < 0){
         alert('Not Enough Items Available');
         return;
     }
     let user_product = {
         name:product.productName,
         id:product.productId,
         quantity:amount,
         price:product.price
     }
     let product_data = {};
     product_data['username'] = $.cookie('username');
     product_data['product'] = user_product;

     $.ajax({
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(product_data),
        success: function (res) {
            console.log(res);
            if(typeof res.posted == 'undefined' && res.posted == false){
                alert("Error Saving to Cart");
                return;
            }
            alert('Saved to Cart')
        },
        error: function (err) {
            alert("Error Saving to Cart");
        },
        processData: false,
        type: 'PATCH',
        url: '/api/addCart'
      })
 }