/* eslint-disable no-restricted-globals */
/* eslint-disable no-plusplus */
const fs = require('fs').promises;

const { readCart, resetCart, readProducts } = require('../intermediary');
const axiosInstance = require('../services/pagarme');

// eslint-disable-next-line consistent-return
function validateCustomer(customer) {
  if (!customer.type || customer.type === '') {
    return 'O campo type é obrigatório';
  }

  if (customer.type !== 'individual') {
    return "O campo type dever ser 'individual' (este e-commerce só atende pessoas físicas)";
  }

  if (!customer.country || customer.country === '') {
    return 'O campo country é obrigatório';
  }

  if (customer.country.length !== 2) {
    return 'Verifique o campo country, ele deve ter dois dígitos';
  }

  if (!customer.name || customer.name === '') {
    return 'O campo name é obrigatório';
  }

  if (!customer.name.includes(' ')) {
    return 'O nome deve conter primeiro nome e sobrenome';
  }

  if (!customer.documents || customer.documents.length === 0) {
    return 'Os dados do campo documents são obrigatórios';
  }

  if (!customer.documents[0].type || customer.documents[0].type === '') {
    return 'O dado type de documents é obrigatório';
  }

  if (!customer.documents[0].number || customer.documents[0].number === '') {
    return 'O dado number de documents é obrigatório';
  }

  if (customer.documents[0].number.length !== 11 || isNaN(customer.documents[0].number)) {
    return 'O campo number deve conter 11 digitos numéricos';
  }
}

const checkout = async (req, res) => {
  const { body } = req;

  try {
    const error = validateCustomer(body.customer);

    if (error) {
      res.status(400);
      return res.json({ mensagem: error });
    }

    const cart = await readCart('./data/cart.json');
    const products = await readProducts('./data/products.json');

    if (cart.produtos.length === 0) {
      res.status(400);
      return res.json({ mensagem: 'O carrinho está vazio!' });
    }

    const request = await axiosInstance.post('transactions', body);

    const updatedProductsArray = [];

    for (let i = 0; i < cart.produtos.length; i++) {
      for (let j = 0; j < products.length; j++) {
        if (cart.produtos[i].id === products[j].id) {
          if (products[j].estoque < cart.produtos[i].quantidade) {
            res.status(400);
            return res.json({
              mensagem: `O produto (${cart.produtos[i].nome}) não tem estoque(${products[j].estoque}) suficiente para essa quantidade(${cart.produtos[i].quantidade}) desejada`,
            });
          }

          products[j].estoque -= cart.produtos[i].quantidade;
          updatedProductsArray.push(products[j]);
        }
      }
    }

    const sales = JSON.parse(await fs.readFile('./data/sales.json', (e, data) => data)).vendas;

    const sale = {
      id: sales.length + 1,
      dataVenda: new Date(),
      produtos: cart.produtos,
      valorVenda: cart.totalAPagar,
      linkBoleto: request.data.boleto_url,
    };

    fs.writeFile('./data/products.json', JSON.stringify({ produtos: products }, null, 2));
    fs.writeFile('./data/sales.json', JSON.stringify({ vendas: [...sales, sale] }, null, 2));

    resetCart('./data/cart.json');

    res.status(200);
    return res.json({
      mensagem: 'Compra efetuada com sucesso!',
      cart,
      linkBoleto: request.data.boleto_url,
    });
  } catch (error) {
    const { data: { errors }, status } = error.response;

    return res.status(status).json({
      erro: `${errors[0].parameter_name} - ${errors[0].message}`,
    });
  }
};

module.exports = { checkout };
