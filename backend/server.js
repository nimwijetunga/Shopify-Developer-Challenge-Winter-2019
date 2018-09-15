const express = require('express')
const bodyParser = require('body-parser');
const app = express();
var admin = require('firebase-admin');

require('dotenv').config()

//Initialize firebase DB
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.clientEmail,
        privateKey: process.env.privateKey.replace(/\\n/g, '\n')
    }),
    databaseURL: "https://shopifyproducts-b6758.firebaseio.com/"
});


var products_db = require('./products_db.js');
var user_db = require('./user_db.js');
var empty = require('is-empty');

var express_options = {
    extensions: ['htm', 'html'],
}

const root = { root: './frontend' }

function get_response(response) {
    return JSON.stringify({ posted: response });
}

function get_response_del(response) {
    return JSON.stringify({ deleted: response });
}

//POST Req for products
async function addProduct(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    var admin_password = req.get('admin-password');
    if(admin_password != "1234"){
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    //Get post req body
    let quantity = body.quantity, productId = body.productId, productName = body.productName, price = body.price;
    if (empty(productId) || empty(productName) || empty(price) || empty(quantity) || isNaN(quantity)) {
        res.send(get_response(false));
        return;
    }

    //Add the product to the DB and send response
    let add_product_response = await products_db.add_product(productId, productName, price, quantity).catch(err => { return false; });
    if (!add_product_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

//GET Request for products
async function getProduct(req, res) {
    var productId = req.query['productId'];
    //Get the product info and send response
    var products = await products_db.find_product_info(productId).catch(err => { return false; });
    if (!products) {
        res.send(get_response(false));
    } else {
        res.send(JSON.stringify(products));
    }
}

//DELETE Request for products
async function deleteProduct(req, res) {
    //Get product id from header
    var productId = req.get('productId');
    if (empty(productId)) {
        res.send(get_response_del(false));
        return;
    }
    //Delete product from DB and send response
    let delete_product_response = await products_db.delete_product(productId).catch(err => { return false; });
    if (!delete_product_response) {
        res.send(get_response_del(false));
    } else {
        res.send(get_response_del(true));
    }
}

//PATCH req to modify product entries 
async function modifyProduct(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    let productId = body.productId, quantity = body.quantity;

    if (empty(productId) || empty(quantity) || isNaN(quantity)) {
        res.send(get_response(false));
        return;
    }

    let product_modification_response = await products_db.update_product_amount(productId, quantity).catch(err => { return false; });

    if (!product_modification_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

//POST req to create a new user
async function createUser(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    let password = body.password, username = body.username, first = body.first, last = body.last;

    if (empty(password) || empty(username) || empty(first) || empty(last)) {
        res.send(get_response(false));
        return;
    }

    let add_user_response = await user_db.sign_up(first, last, username, password).catch(err => { return false; });

    if (!add_user_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }

}

//User login authentication system
async function login(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    let password = body.password, username = body.username;

    if (empty(password) || empty(username)) {
        res.send(get_response(false));
        return;
    }

    let login_response = await user_db.login(username, password).catch(err => { return false; });

    if (!login_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

//PATCH req to add a product to the users invoice
async function addCart(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    let username = body.username, product = body.product;
    if (empty(username) || empty(product) || isNaN(product.quantity)) {
        res.send(get_response(false));
        return;
    }

    let add_product_response = await user_db.add_to_cart(username, product);
    if (!add_product_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

//GET req to get the user profile
async function userProfile(req, res) {
    var username = req.query['username'];
    if (empty(username)) {
        res.send(get_response(false));
        return;
    }

    let profile = await user_db.get_user_profile(username).catch(err => { return false });

    if (!profile) {
        res.send(get_response(false));
    } else {
        res.send(JSON.stringify(profile));
    }
}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

//Products db endpoints
app.post('/api/addProduct', [addProduct]) //Add prod to DB

app.get('/api/getProduct', [getProduct])//Get a product from DB

app.delete('/api/deleteProduct', [deleteProduct])//Delete product from DB

app.patch('/api/modifyProduct', [modifyProduct])//Modify product info (like quanity avialable)


//User db endpoints
app.post('/api/createUser', [createUser]) //Create user

app.post('/api/login', [login])//Login authentication 

app.patch('/api/addCart', [addCart])//Add item to users invoice

app.get('/api/userProfile', [userProfile])//get the usre profile


app.set('port', process.env.port || 3000)

//Rendering Frontend

app.use(express.static('./frontend', express_options))

app.get('/signup', (req, res) => {
    res.sendFile("signup.html", root);
})

app.get('/products', (req, res) => {
    res.sendFile("products.html", root);
})

app.listen(app.get('port'), () => {
    console.log("App started on port: " + app.get('port'));
})
