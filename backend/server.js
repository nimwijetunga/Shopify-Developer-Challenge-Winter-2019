const express = require('express')
const bodyParser = require('body-parser');
const app = express();
var admin = require('firebase-admin');

var serviceAccount = require('../serviceAccountKey.json');

//Initialize firebase DB
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shopifyproducts-b6758.firebaseio.com/"
});

var products_db = require('./products_db.js');
var user_db = require('./user_db.js');
var empty = require('is-empty');

function get_response(response){
    return JSON.stringify({posted:response});
}

function get_response_del(response){
    return JSON.stringify({deleted:response});
}

//POST Req for products
async function addProduct(req, res){
    if(empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    //Get post req body
    let productId = body.productId, productName = body.productName, price = body.price, img_url = body.img_url;
    if(empty(productId) || empty(productName) || empty(price) || empty(img_url)){
        res.send(get_response(false));
        return;
    }

    //Add the product to the DB and send response
    let add_product_response = await products_db.add_product(productId, productName, price, img_url);
    if(!add_product_response){
        res.send(get_response(false));
    }else{
        res.send(get_response(true));
    }
}

//GET Request for products
async function getProduct(req, res){
    var productId = req.query['productId'];
    //Get the product info and send response
    var products = await products_db.find_product_info(productId);
    if(!products){
        res.send(get_response(false));
    }else{
        res.send(JSON.stringify(products));
    }
} 

//DELETE Request for products
async function deleteProduct(req, res){
    //Get product id from header
    var productId = req.get('productId');
    if(empty(productId)){
        res.send(get_response_del(false));
        return;
    }
    //Delete product from DB and send response
    let delete_product_response = await products_db.delete_product(productId);
    if(!delete_product_response){
        res.send(get_response_del(false));
    }else{
        res.send(get_response_del(true));
    }
}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

//Products db endpoints
app.post('/api/addProduct', [addProduct])

app.get('/api/getProduct', [getProduct])

app.delete('/api/deleteProduct', [deleteProduct])

app.set('port', process.env.port || 3000)

app.listen(app.get('port'), () => {
    console.log("App started on port: " + app.get('port'));
})