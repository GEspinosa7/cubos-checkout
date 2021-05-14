const express = require('express');
const { showCart, addProductsToCart, removeProduct, cleanCart } = require('./controllers/cart');
const { listProducts } = require('./controllers/products');

const router = express();

//products
router.get('/produtos', listProducts);

//cart
router.get('/carrinho', showCart);
router.post('/carrinho/produtos', addProductsToCart);
router.delete('/carrinho/produtos/:idProduct', removeProduct);
router.delete('/carrinho', cleanCart);

module.exports = router;