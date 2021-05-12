const fs = require('fs').promises;

const showCart = async (req, res) => {

   try {
      const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));

      res.status(200);
      res.json(cart);

   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }
}

const addProductsToCart = async (req, res) => {

   try {
      const { body } = req;

      const products = JSON.parse(await fs.readFile('./data/products.json', (e, data) => data)).produtos;

      const product = products.find(p => p.id === Number(body.id));

      if (!product) {
         res.status(404);
         return res.json({
            mensagem: `O produto como id ${body.id} não existe`
         });
      }

      if (product.estoque === 0) {
         res.status(404);
         return res.json({
            mensagem: `O produto como id ${body.id} não está em estoque`
         });
      }

      if (body.quantidade > product.estoque) {
         res.status(404);
         return res.json({
            mensagem: `Só temos ${product.estoque} desse produto em estoque`
         });
      }

      const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));

      const cartProducts = cart.produtos;

      const newProduct = {
         "id": product.id,
         "quantidade": body.quantidade,
         "nome": product.nome,
         "preco": product.preco,
         "categoria": product.categoria,
      }

      const cartProduct = cartProducts.find(p => p.id === product.id);

      const productIndex = products.indexOf(product);

      if (cartProduct) {
         cartProduct.quantidade += body.quantidade;
         products[productIndex].estoque -= body.quantidade;
      } else {
         cartProducts.push(newProduct);
         products[productIndex].estoque -= body.quantidade;
      }

      let productSubtotal = 0;
      for (let p of cartProducts) {
         productSubtotal += (p.quantidade * p.preco);
      }

      let shipping = 0;
      if (productSubtotal <= 20000) {
         shipping = 5000;
      }

      let date = new Date();
      date.setDate(date.getDate() + 15);

      const addToCart = {
         "subTotal": productSubtotal,
         "dataDeEntrega": date,
         "valorDoFrete": shipping,
         "totalAPagar": (productSubtotal + shipping),
         "produtos": cartProducts
      }

      fs.writeFile('./data/products.json', JSON.stringify({ "produtos": products }, null, 2));

      fs.writeFile('./data/cart.json', JSON.stringify(addToCart, null, 2));

      res.status(200);
      res.json(cart);
   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }

}

const removeProducts = async (req, res) => {

   try {
      const { idProduct } = req.params;

      const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));

      const cartProducts = cart.produtos;

      const product = cartProducts.find(p => p.id === Number(idProduct));

      if (!product) {
         res.status(400);
         return res.json({
            msg: `O produto do id ${idProduct} não se encontra no carrinho`
         });
      }

      const productIndex = cartProducts.indexOf(product);

      cartProducts.splice(productIndex, 1);

      fs.writeFile('./data/cart.json', JSON.stringify({
         "subTotal": cart.subTotal,
         "dataDeEntrega": cart.dataDeEntrega,
         "valorDoFrete": cart.valorDoFrete,
         "totalAPagar": cart.totalAPagar,
         "produtos": cartProducts,
      }, null, 2));

      res.json(cart);
   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }
}

module.exports = { showCart, addProductsToCart, removeProducts };