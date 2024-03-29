const express = require('express')
const bodyParser = require('body-parser');
const app = express();
var admin = require('firebase-admin');
var Validator = require('jsonschema').Validator;
var v = new Validator();
var jwt = require('jsonwebtoken');
var config = require('./config.js');


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

function create_token(userId){
    return jwt.sign({ id: userId }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });
}

function decode_username(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                reject(false);
            }else{
                resolve(decoded);
            }
        });
    })
}

async function is_valid_user(req){
    let token = req.get('token');
    let decoded_token = await decode_username(token).catch(err => {return false;});
    if(!decoded_token){
        return false;
    }
    return true;
}

/**
 * @api {post} /api/addProduct Add Product
 * @apiName /api/addProduct
 * @apiGroup Product
 * @apiDescription Add product user to products database
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "admin-token": "xxxx"
 *     }
 * @apiParamExample {json} Request-Example:
 *  {
 *      "productId":"19",
 *	    "productName":"peach",
 *	    "price":4,
 *	    "quantity": 200
 *   }
 *
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "posted":true
 *   }
 *
 * @apiError Product could not be added.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
async function addProduct(req, res) {

    var prod_schema = {
        "type": "object",
        "properties": {
            "productName":{"type":"string"},
            "price":{"type":"number"},
            "quantity":{"type":"number"},
        },
        "required":["productId", "productName", "price", "quantity"]
    }
    
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    var admin_token = req.get('admin-token');
    var username = await decode_username(admin_token).catch(err => {return false;});
    if(username.id != process.env.adminUsername){
        res.send(get_response(false));
        return;
    }

    //Get post req body
    let body = req.body;

    if(!empty(v.validate(req.body, prod_schema).errors)){
        res.send(get_response(false));
        return;
    }
    let quantity = body.quantity, productId = body.productId, productName = body.productName, price = body.price;

    //Add the product to the DB and send response
    let add_product_response = await products_db.add_product(productId, productName, price, quantity).catch(err => { return false; });
    if (!add_product_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

/**
 * @api {get} /api/getProduct/ Get Product(s)
 * @apiName /api/getProduct
 * @apiGroup Product
 * @apidescription Get a list of products or a single product(if product param is specified)
 * @apiParam {productId} Product unique id.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "xxxx"
 *     }
 *
 * @apiSuccessExample Success-Response:
 *  [
 *          {
 *               "productId": "1",
 *               "productName": "pear",
 *               "price": 13,
 *               "key": "-LM5i9ElD6_7kv0VJrHN",
 *               "quantity":270
 *           },
 *           {
 *               "productId": "2",
 *               "productName": "apple",
 *               "price": 1,
 *               "key": "-LM5lJwDYyAErIJM9mJL"
 *               "quantity":370
 *           }
 *   ]
 *
 * @apiError Product could not be found.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
async function getProduct(req, res) {
    var productId = req.query['productId'];
    if(!(await is_valid_user(req))){
        res.send(get_response(false));
        return;
    }    
    //Get the product info and send response
    var products = await products_db.find_product_info(productId).catch(err => { return false; });
    if (!products) {
        res.send(get_response(false));
    } else {
        res.send(JSON.stringify(products));
    }
}

/**
 * @api {delete} /api/deleteProduct Delete Product
 * @apiName /api/deleteProduct
 * @apiGroup Product
 * @apidescription Delete a product given a product ID
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "productID": "1",
 *       "token" "xxxx"
 *     }
 *
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "deleted": true
 *   }
 *
 * @apiError Product could not be deleted.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "deleted": false
 *     }
 */
async function deleteProduct(req, res) {
    //Get product id from header
    var productId = req.get('productId');

    if(!(await is_valid_user(req))){
        res.send(get_response(false));
        return;
    }   

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

/**
 * @api {patch} /api/modifyProduct Modify Product
 * @apiName /api/modifyProduct
 * @apiGroup Product
 * @apidescription Modify product information
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "xxxx"
 *     }
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *	    "productId":1,
	    "quantity": 10
 *  }
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "posted":true
 *   }
 *
 * @apiError Product could not be modified.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
async function modifyProduct(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    if(!(await is_valid_user(req))){
        res.send(get_response(false));
        return;
    }   

    let body = req.body;

    var schema = {
        "type": "object",
        "properties": {
            "productId":{"type":"string"},
            "quantity":{"type":"number"},
        },
        "required":["productId", "quantity"]
    }

    let productId = body.productId, quantity = body.quantity;

    if (!empty(v.validate(req.body, schema).errors)) {
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

/**
 * @api {post} /api/createUser/ Sign-Up
 * @apiName /api/createUser/
 * @apiGroup User
 * @apiDescription Create a new user in the DB
 * @apiParamExample {json} Request-Example:
 *  {
 *       "password":"1234",
 *       "username":"person123",
 *       "first":"Person",
 *       "last":"Last"
 *   }
 *
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "posted":true,
 *      "token":"xxxx"
 *   }
 *
 * @apiError User could not be created.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
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
        let token = await create_token(username);
        res.send({posted:true, token:token});
    }

}

/**
 * @api {post} /api/login Login
 * @apiName /api/login
 * @apiGroup User
 * @apiDescription Login user to shop
 * @apiParamExample {json} Request-Example:
 *  {
 *       "password":"1234",
 *       "username":"person123",
 *   }
 *
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "posted":true,
 *      "token":"xxxx"
 *   }
 *
 * @apiError User was not found.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
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
        let token = await create_token(username);
        res.send({posted:true, token:token});
    }
}

/**
 * @api {patch} /api/addCart Add Cart
 * @apiName /api/addCart
 * @apiGroup User
 * @apidescription Add product to cart
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "xxxx"
 *     }
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *	"product":{
 *		"name":"orange",
 *		"quantity":7,
 *		"price":4,
 *		"id":3
 *	  }
 *   }
 *
 * @apiSuccessExample Success-Response:
 *  {
 *      "posted":true
 *   }
 *
 * @apiError Product could not be added to cart.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
async function addCart(req, res) {
    if (empty(req) || empty(req.body)) {
        res.send(get_response(false));
        return;
    }

    let body = req.body;

    let token = req.get('token');
    
    var username = await decode_username(token).catch(err => {return false;});
    username = username.id;
    if(!username){
        res.send(get_response(false));
        return;
    }

    var schema = {
        "type": "object",
        "properties": {
            "product":{
                "type":"object",
                "properties":{
                    "quantity":{"type":"number"}
                }
            },
        },
        "required":["product"]
    }

    let product = body.product;
    if (!empty(v.validate(req.body, schema).errors)) {
        res.send(get_response(false));
        return;
    }

    let add_product_response = await user_db.add_to_cart(username, product).catch(err => {return false;});
    if (!add_product_response) {
        res.send(get_response(false));
    } else {
        res.send(get_response(true));
    }
}

/**
 * @api {get} /api/userProfile/ User Profile
 * @apiName /api/userProfile
 * @apiGroup User
 * @apidescription Request User information
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "xxxx"
 *     }
 *
 * @apiSuccessExample Success-Response:
 *  {
 *   "username": "nim.wijetunga@gmail.com",
 *    "products": [
 *          {
 *               "id": "1",
 *               "name": "apple",
 *               "price": 12,
 *               "quantity": 4
 *           },
 *           {
 *               "id": "3",
 *             "name": "orange",
 *              "price": 12,
 *               "quantity": 2
 *          }
 *       ]
 *   }
 *
 * @apiError User was not found.
 *
 * @apiErrorExample Error-Response:
 *     {
 *        "posted": false
 *     }
 */
async function userProfile(req, res) {
    var token = req.get('token');
    let username = await decode_username(token).catch(err => {return false;});
    username = username.id;
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


/**********************User db endpoints************/

app.post('/api/createUser', [createUser]) //Create user

app.post('/api/login', [login])//Login authentication 

app.patch('/api/addCart', [addCart])//Add item to users invoice

app.get('/api/userProfile', [userProfile])//get the usre profile


app.set('port', process.env.PORT || 3000)

//Rendering Frontend
app.use(express.static('./frontend', express_options))
app.use(express.static('./frontend/apidoc', express_options))

app.get('/signup', (req, res) => {
    res.sendFile("signup.html", root);
})

app.get('/products', (req, res) => {
    res.sendFile("products.html", root);
})

app.get('/docs', (req, res) => {
    res.sendFile("index.html", {root:'./frontend/apidoc'});
})

app.listen(app.get('port'), () => {
    console.log("App started on port: " + app.get('port'));
})
