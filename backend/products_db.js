var admin = require('firebase-admin');
var exists = require('exists');

//Initialize db
var ref = admin.app().database().ref();
var productsRef = ref.child('products');
var productRef = productsRef.push();

// async function test(){
//     await prod_db.add_product(1, "apple", 1, "apple.jpg")
//     await prod_db.add_product(2, "orange", 1, "orange.jpg")
//     let products = await prod_db.find_product_info();
//     console.log(products);
//     await prod_db.delete_product(2);
//     products = await prod_db.find_product_info();
//     console.log(products);
// }

// test();

module.exports = {
    /**
     * Add a product to the database
     * @param {int} productId unique id
     * @param {String} productName 
     * @param {floar} price 
     * @param {String} img_url for front_end use
     */
    add_product: function (productId, productName, price, img_url, quantity) {
        return new Promise(function (resolve, reject) {
            productsRef.push({
                productId: productId,
                productName: productName,
                price: price,
                img_url: img_url,
                quantity:quantity
            }, (error) => {
                reject(false);
            });
            resolve(true);
        });
    },

    /**
     * Fetch a product with given id from db (if no product provided then return an array of all products)
     * @param {int} productId 
     * @returns product if single product found, or array of products if no input parameter is specified
     */
    find_product_info: function (productId) {
        return new Promise(function (resolve, reject) {
            productsRef.on('value', function (snap) {
                var products = [];
                snap.forEach(function (child) {
                    let val = child.val();
                    let quantity = val.quantity, productIdCur = val.productId, productName = val.productName, price = val.price, img_url = val.img_url, key = child.key
                    let product = {
                        productId: productIdCur,
                        productName: productName,
                        price: price,
                        img_url: img_url,
                        key: key,
                        quantity: quantity
                    }
                    products.push(product);
                    if (exists(productId)) {
                        if (productId == productIdCur) {
                            resolve(product);//Product exists
                        }
                    }
                });
                if (exists(productId)) {
                    reject(false);//Product doesn't exists
                } else {
                    resolve(products);
                }
            });
        });
    },

    update_product_amount: async function(productId, product_amount){
        let product = await this.find_product_info(productId).catch((err) => {
            return false;
        })
        if (!product) return false;

        let update = {
            quantity: product_amount
        };

        var productsRef = ref.child('products/' + product.key);

        return new Promise(function (resolve, reject) {
            productsRef.update(update, (err) => {
                if (err) reject(false);
                else resolve(true);
            })
        })
    },

    /**
     * deletes a product from the database
     * @param {int} productId is unique product id
     */
    delete_product: async function (productId) {
        let product = await this.find_product_info(productId).catch((err) => {
            return false;
        })
        if (!product || !product.key) return false;
        let key = product.key;

        return new Promise((resolve, reject) => {
            ref.child('products').child(key).remove((err) => {
                if (err) reject(false);
                else resolve(true);
            });
        })
    }
};