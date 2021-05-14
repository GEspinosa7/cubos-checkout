const express = require('express');
const { showCart, addProductsToCart, removeProduct, cleanCart, updateProduct } = require('./controllers/cart');
const { listProducts } = require('./controllers/products');

const router = express();

//products
router.get('/produtos', listProducts);

//cart
router.get('/carrinho', showCart);
router.post('/carrinho/produtos', addProductsToCart);
router.patch('/carrinho/produtos/:idProduct', updateProduct);
router.delete('/carrinho/produtos/:idProduct', removeProduct);
router.delete('/carrinho', cleanCart);

module.exports = router;