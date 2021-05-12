const express = require('express');
const { showCart, addProductsToCart, removeProducts } = require('./controllers/cart');
const { listProducts } = require('./controllers/products');

const router = express();

//products
router.get('/produtos', listProducts);

//cart
router.get('/carrinho', showCart);
router.post('/carrinho/produtos', addProductsToCart);
router.delete('/carrinho/produtos/:idProduct', removeProducts);

module.exports = router;