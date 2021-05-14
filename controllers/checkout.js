const fs = require('fs').promises;


const checkout = async (req, res) => {

   const cart = JSON.parse(await fs.readFile('./data/cart.json', (e, data) => data));
   const products = JSON.parse(await fs.readFile('./data/products.json', (e, data) => data)).produtos;

   if (cart.produtos.length === 0) return res.json({ mensagem: "O carrinho está vazio!" })

   const updatedProductsArray = [];

   for (let i = 0; i < cart.produtos.length; i++) {
      for (let j = 0; j < products.length; j++) {
         if (cart.produtos[i].id === products[j].id) {
            if (products[j].estoque < cart.produtos[i].quantidade) return res.json({
               mensagem: `O produto (${cart.produtos[i].nome}) não tem estoque(${products[j].estoque}) suficiente para essa quantidade(${cart.produtos[i].quantidade}) desejada`
            });

            products[j].estoque -= cart.produtos[i].quantidade;
            updatedProductsArray.push(products[j]);
         }
      }
   }

   const customerType = req.body.customer.type;
   const { country, name, documents } = req.body.customer;

   if (!customerType || customerType === '') {
      res.status(400);
      return res.json({
         mensagem: "Informe o dado type"
      })
   }

   if (customerType !== 'individual') {
      res.status(400);
      return res.json({
         mensagem: "O campo type dever ser 'individual' (este e-commerce só atende pessoas físicas)"
      })
   }

   if (!country || country === '') {
      res.status(400);
      return res.json({
         mensagem: "Informe o dado country"
      })
   }

   if (country.length !== 2) {
      res.status(400);
      return res.json({
         mensagem: "Verifique o campo country, ele deve ter dois dígitos"
      })
   }

   if (!name || name === '') {
      res.status(400);
      return res.json({
         mensagem: "Informe o dado name"
      })
   }

   if (!name.includes(" ")) {
      return res.json({
         mensagem: "O nome deve conter primeiro nome e sobrenome"
      })
   }

   if (!documents || documents.length === 0) {
      res.status(400);
      return res.json({
         mensagem: "Informe os dados de documents"
      })
   }

   if (!documents[0].type || documents[0].type === '') {
      res.status(400);
      return res.json({
         mensagem: "Informe o dado type de documents"
      })
   }

   if (!documents[0].number || documents[0].number === '') {
      res.status(400);
      return res.json({
         mensagem: "Informe o dado number de documents"
      })
   }

   if (documents[0].number.length !== 11 || isNaN(documents[0].number)) {
      res.status(400);
      return res.json({
         mensagem: "O campo numver deve conter 11 digitos numéricos"
      })
   }

   //abate do estoque
   fs.writeFile('./data/products.json', JSON.stringify({ "produtos": products }, null, 2));

   //limpa carrinho
   fs.writeFile('./data/cart.json', JSON.stringify({
      "subTotal": 0,
      "dataDeEntrega": null,
      "valorDoFrete": 0,
      "totalAPagar": 0,
      "produtos": [],
   }, null, 2));



   res.json({
      mensagem: "Compra efetuada com sucesso!",
      cart
   });
}

module.exports = { checkout }