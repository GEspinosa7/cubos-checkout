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



      if (cartProduct) {
         cartProduct.quantidade += body.quantidade;
      } else {
         cartProducts.push(newProduct);
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

const updateProduct = async (req, res) => {

   try {
      const { idProduct } = req.params;
      const { quantidade } = req.body;

      const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));
      const cartProducts = cart.produtos;

      const products = JSON.parse(await fs.readFile('./data/products.json', (e, data) => data)).produtos;

      const cartProduct = cartProducts.find(p => p.id === Number(idProduct));

      if (!cartProduct) {
         res.status(404);
         res.json({
            mensagem: `O produto com o id ${idProduct} não está no carrinho`
         })
      }

      const product = products.find(p => p.id === Number(idProduct));

      if (quantidade === 0) return res.json({ erro: "Informe um numero maior ou menor que 0" });

      if (quantidade < 0) {
         if (Math.abs(quantidade) > cartProduct.quantidade) return res.json({ erro: "Não tem como remover mais items do que já existe" });

         if (cartProduct.quantidade - Math.abs(quantidade) === 0) {
            const productIndex = cartProducts.indexOf(cartProduct);

            cartProducts.splice(productIndex, 1);

            if (cartProducts.length === 0) {
               fs.writeFile('./data/cart.json', JSON.stringify({
                  "subTotal": 0,
                  "dataDeEntrega": 0,
                  "valorDoFrete": 0,
                  "totalAPagar": 0,
                  "produtos": cartProducts,
               }, null, 2));

               return res.json(cart);
            }

            fs.writeFile('./data/cart.json', JSON.stringify({
               "subTotal": cart.subTotal,
               "dataDeEntrega": cart.dataDeEntrega,
               "valorDoFrete": cart.valorDoFrete,
               "totalAPagar": cart.totalAPagar,
               "produtos": cartProducts,
            }, null, 2));

            return res.json(cart);
         }

         const productIndex = cartProducts.indexOf(cartProduct);

         const updatedProduct = {
            "id": cartProduct.id,
            "quantidade": cartProduct.quantidade + quantidade,
            "nome": cartProduct.nome,
            "preco": cartProduct.preco,
            "categoria": cartProduct.categoria,
         }

         cartProducts.splice(productIndex, 1, updatedProduct);

         fs.writeFile('./data/cart.json', JSON.stringify({
            "subTotal": cart.subTotal,
            "dataDeEntrega": cart.dataDeEntrega,
            "valorDoFrete": cart.valorDoFrete,
            "totalAPagar": cart.totalAPagar,
            "produtos": cartProducts,
         }, null, 2));

         return res.json(cart);

      }

      if (product.estoque < (cartProduct.quantidade + quantidade)) {
         return res.json({
            mensagem: "Não existe estoque suficiente para adicionar mais desse produto"
         });
      }

      const productIndex = cartProducts.indexOf(cartProduct);

      const updatedProduct = {
         "id": cartProduct.id,
         "quantidade": cartProduct.quantidade + quantidade,
         "nome": cartProduct.nome,
         "preco": cartProduct.preco,
         "categoria": cartProduct.categoria,
      }

      cartProducts.splice(productIndex, 1, updatedProduct);

      fs.writeFile('./data/cart.json', JSON.stringify({
         "subTotal": cart.subTotal,
         "dataDeEntrega": cart.dataDeEntrega,
         "valorDoFrete": cart.valorDoFrete,
         "totalAPagar": cart.totalAPagar,
         "produtos": cartProducts,
      }, null, 2));

      return res.json(cart);

   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      });
   }

   res.json({
      teste: true,
   })
}

const removeProduct = async (req, res) => {

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

      if (cartProducts.length === 0) {
         fs.writeFile('./data/cart.json', JSON.stringify({
            "subTotal": 0,
            "dataDeEntrega": 0,
            "valorDoFrete": 0,
            "totalAPagar": 0,
            "produtos": cartProducts,
         }, null, 2));

         return res.json(cart);
      }

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

const cleanCart = async (req, res) => {
   try {

      const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));

      if (cart.produtos.length === 0) {
         return res.json({
            mensagem: "O carrinho ja está vazio"
         });
      }

      fs.writeFile('./data/cart.json', JSON.stringify({
         "subTotal": 0,
         "dataDeEntrega": null,
         "valorDoFrete": 0,
         "totalAPagar": 0,
         "produtos": [],
      }, null, 2));

      res.json({
         mensagem: "Todos os items do carrinho foram removidos com sucesso!"
      })

   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }
}

module.exports = { showCart, cleanCart, addProductsToCart, removeProduct, updateProduct };