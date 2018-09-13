$(document).ready(function (e) {
    let username = $.cookie('username');
    if(typeof username == 'undefined' || username == "null"){
        window.location = "/";
    }
    save_productslist();
});


function save_productslist() {
    $.ajax({
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (typeof res.posted != 'undefined' && res.posted === false) {
                alert("Error Fetching Products");
                return;
            }
            localStorage.setItem('products', JSON.stringify(res));
            var products = JSON.parse(JSON.stringify(res));
            render_products(products);
            render_invoice();
            add_event_listners();

        },
        error: function (err) {
            alert("Error Fetching Data");
        },
        processData: false,
        type: 'GET',
        url: '/api/getProduct'
    })
}

function render_products(products) {

    //Pre-process data
    for (var i = 0; i < products.length; i++) {
        products[i]['class'] = (i == 0) ? 'carousel-item active' : 'carousel-item';
    }

    $("#template").hide();
    template = $('#template').val();
    html = Mustache.render(template, products);
    $('#result').html(html);
}

function search(productId, products) {
    for (var i = 0; i < products.length; i++) {
        if (products[i].productId === productId) {
            return products[i];
        }
    }
}

function add_event_listners() {
    $("[class*=add-cart]").click(function (event) {
        var productId = event.target.id;
        var amount = $(`#${productId}-amount`).val();
        buy_item(amount, productId);
    });
    $("#sign-out").click(function () {
        $.cookie('username', null, { path: '/' });
        location.reload();
    })
}

function get_user_profile(username){
    if(!username) return false;
    return new Promise((resolve, reject) => {
        $.ajax({
            success: function (res) {
                if (typeof res.deleted != 'undefined' && res.deleted === false) {
                    alert("Error Fetching Invoice");
                    resolve(false);
                    return;
                }
                resolve(JSON.parse(JSON.stringify(res)));
            },
            error: function (err) {
                alert("Error Fetching Invoice");
                resolve(false);
            },
            processData: false,
            type: 'GET',
            url: '/api/userProfile?username='+username
        })
    })
}

async function render_invoice(){
    var username = $.cookie('username');
    let userProfile = await get_user_profile(username).catch(err => {return false;});
    if(!userProfile) return false;
    userProfile = JSON.parse(userProfile);
    if(!userProfile.products) return false;
    let user_products = userProfile.products;
    var total_cost = 0

    //Get total purchase cost for user
    user_products.forEach((product) => {
        total_cost += Number(product.price) * Number(product.quantity);
    });   
    
    user_products['total'] = total_cost;

    template = $('#template-invoice').val();
    html = Mustache.render(template, user_products);
    $('#result-invoice').html(html);
}

function delete_product(productId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            headers: {
                'productID': productId,
            },
            success: function (res) {
                console.log(res);
                if (typeof res.deleted != 'undefined' && res.deleted === false) {
                    resolve(false);
                    return;
                }
                resolve(true);
            },
            error: function (err) {
                alert("Error Deleting Product");
                resolve(false);
            },
            processData: false,
            type: 'DELETE',
            url: '/api/deleteProduct'
        })
    })
}

function update_product_info(productId, amount) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ productId: productId, quantity: amount }),
            success: function (res) {
                console.log(res);
                if (typeof res.posted != 'undefined' && res.posted === false) {
                    alert("Error Updating Products");
                    resolve(false);
                    return;
                }
                resolve(true);
            },
            error: function (err) {
                resolve(false)
                alert("Error Updating Products");
            },
            processData: false,
            type: 'PATCH',
            url: '/api/modifyProduct'
        })
    })
}

function save_to_cart(product_data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(product_data),
            success: function (res) {
                console.log(res);
                if (typeof res.posted != 'undefined' && res.posted === false) {
                    alert("Error Saving to Cart");
                    resolve(false);
                    return;
                }
                alert('Saved to Cart')
                resolve(true)
            },
            error: function (err) {
                alert("Error Saving to Cart");
                resolve(false);
            },
            processData: false,
            type: 'PATCH',
            url: '/api/addCart'
        })
    })
}

async function buy_item(amount, productId) {
    if (typeof productId == 'undefined' || typeof amount == 'undefined' || !productId || !amount) {
        return;
    }
    let products = JSON.parse(localStorage.getItem('products'));
    let product = search(productId, products);
    if (product.quantity - amount < 0) {
        alert('Not Enough Items Available');
        return;
    } else {
        let user_product = {
            name: product.productName,
            id: product.productId,
            quantity: amount,
            price: product.price
        }
        let product_data = {};
        product_data['username'] = $.cookie('username');
        product_data['product'] = user_product;

        await save_to_cart(product_data);

        if (product.quantity - amount == 0) {
            //delete product
            await delete_product(productId);
        } else {
            await update_product_info(productId, product.quantity - amount);
        }
        location.reload();
    }
}