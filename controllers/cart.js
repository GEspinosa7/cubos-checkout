const fs = require('fs').promises;
const { readCart, modifyCart, resetCart, readProducts } = require('../intermediary');

const showCart = async (req, res) => {
   try {
      const cart = await readCart('./data/cart.json');
      res.status(200);
      res.json(cart);
   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }
}

function validateProduct(product, body) {
   if (!product) return `O produto como id ${body.id} não existe`;

   if (product.estoque === 0) return `O produto como id ${body.id} não está em estoque`;

   if (body.quantidade > product.estoque) return `Só temos ${product.estoque} desse produto em estoque`;

}

const addProductsToCart = async (req, res) => {
   try {
      const { body } = req;
      const products = await readProducts('./data/products.json');
      const product = products.find(p => p.id === Number(body.id));

      const error = validateProduct(product, body);

      if (error) {
         res.status(400);
         return res.json({ mensagem: error });
      }

      const cart = await readCart('./data/cart.json');
      const cartProducts = cart.produtos;
      const cartProduct = cartProducts.find(p => p.id === product.id);

      if (cartProduct) {
         cartProduct.quantidade += body.quantidade;
      } else {
         cartProducts.push({
            "id": product.id,
            "quantidade": body.quantidade,
            "nome": product.nome,
            "preco": product.preco,
            "categoria": product.categoria,
         });
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

      fs.writeFile('./data/cart.json', JSON.stringify({
         "subTotal": productSubtotal,
         "dataDeEntrega": date,
         "valorDoFrete": shipping,
         "totalAPagar": (productSubtotal + shipping),
         "produtos": cartProducts
      }, null, 2));

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

      const cart = await readCart('./data/cart.json');
      const cartProducts = cart.produtos;

      const products = await readProducts('./data/products.json');

      const cartProduct = cartProducts.find(p => p.id === Number(idProduct));

      if (!cartProduct) {
         res.status(404);
         return res.json({
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
               resetCart('./data/cart.json');
               return res.json(cart);
            }

            modifyCart('./data/cart.json', cart, cartProducts);

            return res.json(cart);
         }

         const productIndex = cartProducts.indexOf(cartProduct);

         cartProducts.splice(productIndex, 1, {
            "id": cartProduct.id,
            "quantidade": cartProduct.quantidade + quantidade,
            "nome": cartProduct.nome,
            "preco": cartProduct.preco,
            "categoria": cartProduct.categoria,
         });

         modifyCart('./data/cart.json', cart, cartProducts);

         return res.json(cart);

      }

      if (product.estoque < (cartProduct.quantidade + quantidade)) {
         return res.json({
            mensagem: "Não existe estoque suficiente para adicionar mais desse produto"
         });
      }

      const productIndex = cartProducts.indexOf(cartProduct);

      cartProducts.splice(productIndex, 1, {
         "id": cartProduct.id,
         "quantidade": cartProduct.quantidade + quantidade,
         "nome": cartProduct.nome,
         "preco": cartProduct.preco,
         "categoria": cartProduct.categoria,
      });

      modifyCart('./data/cart.json', cart, cartProducts);

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

      const cart = await readCart('./data/cart.json');

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
         resetCart('./data/cart.json');
         return res.json(cart);
      }

      modifyCart('./data/cart.json', cart, cartProducts);

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

      const cart = await readCart('./data/cart.json');

      if (cart.produtos.length === 0) {
         return res.json({
            mensagem: "O carrinho ja está vazio"
         });
      }

      resetCart('./data/cart.json');

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