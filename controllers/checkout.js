const fs = require('fs').promises;

const { readCart, resetCart, readProducts } = require('../intermediary');

function validateCustomer(customer) {
   if (!customer.type || customer.type === '') {
      return "O campo type é obrigatório";
   }

   if (customer.type !== 'individual') {
      return "O campo type dever ser 'individual' (este e-commerce só atende pessoas físicas)";
   }

   if (!customer.country || customer.country === '') {
      return "O campo country é obrigatório";
   }

   if (customer.country.length !== 2) {
      return "Verifique o campo country, ele deve ter dois dígitos";
   }

   if (!customer.name || customer.name === '') {
      return "O campo name é obrigatório";
   }

   if (!customer.name.includes(" ")) {
      return "O nome deve conter primeiro nome e sobrenome";
   }

   if (!customer.documents || customer.documents.length === 0) {
      return "Os dados do campo documents são obrigatórios"
   }

   if (!customer.documents[0].type || customer.documents[0].type === '') {
      return "O dado type de documents é obrigatório"
   }

   if (!customer.documents[0].number || customer.documents[0].number === '') {
      return "O dado number de documents é obrigatório"
   }

   if (customer.documents[0].number.length !== 11 || isNaN(customer.documents[0].number)) {
      return "O campo number deve conter 11 digitos numéricos"
   }
}


const checkout = async (req, res) => {

   try {
      const cart = await readCart('./data/cart.json');
      const products = await readProducts('./data/products.json');

      const error = validateCustomer(req.body.customer);

      if (error) {
         res.status(400);
         return res.json({ mensagem: error });
      }

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

      fs.writeFile('./data/products.json', JSON.stringify({ "produtos": products }, null, 2));

      resetCart('./data/cart.json');

      res.json({
         mensagem: "Compra efetuada com sucesso!",
         cart
      });
   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      });
   }


}

module.exports = { checkout }