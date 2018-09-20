$(document).ready(function (e) {
    let username = $.cookie('username');
    if(typeof username == 'undefined' || username == "null"){
        window.location = "/";
    }
    save_productslist();
});

function get_products(){
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: 'json',
            success: function (res) {
                console.log(res);
                if (typeof res.posted != 'undefined' && res.posted === false) {
                    alert("Error Fetching Products");
                    resolve(false);
                    return;
                }
                localStorage.setItem('products', JSON.stringify(res));
                var products = JSON.parse(JSON.stringify(res));
                resolve(products);    
            },
            error: function (err) {
                alert("Error Fetching Data");
                resolve(false);
            },
            processData: false,
            type: 'GET',
            url: '/api/getProduct'
        })
    })
}


async function save_productslist() {
    var products = await get_products().catch(err => {return false});
    if(!products) return false;
    render_products(products);
    render_invoice();
    add_event_listners();
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
        if ((products[i].productId) == productId) {
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
    $("#add-product-btn").click(function () {
        add_product();
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
            data: JSON.stringify({ productId: productId, quantity: Number(amount) }),
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

function add_product(){
    let productName = $('#productName').val();
    let productId = $('#productId').val();
    let price = $('#price').val();
    let quantity = $('#quantity').val();
    let admin_password = $('#admin-key').val();

    let product_data = {
        productName:productName,
        productId:productId,
        price:Number(price),
        quantity:Number(quantity)
    }
    console.log(product_data);

    $.ajax({
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
            'admin-password': admin_password
        },
        data: JSON.stringify(product_data),
        success: function (res) {
            if (typeof res.posted != 'undefined' && res.posted === false) {
                alert("Error Adding Product");
                return;
            }
            alert('Added Product')
            location.reload();
        },
        error: function (err) {
            alert("Error Adding Product");
        },
        processData: false,
        type: 'POST',
        url: '/api/addProduct'
    })
}

async function buy_item(amount, productId) {
    if (typeof productId == 'undefined' || typeof amount == 'undefined' || !productId || !amount) {
        return;
    }
    let products = await get_products().catch(err => {return false});

    if(!products) return false;

    let product = search(productId, products);
    if (product.quantity - amount < 0) {
        alert('Not Enough Items Available');
        return;
    } else {
        let user_product = {
            name: product.productName,
            id: Number(product.productId),
            quantity: Number(amount),
            price: Number(product.price)
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