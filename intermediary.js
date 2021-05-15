const fs = require('fs').promises;

const readCart = async (path) => JSON.parse(await fs.readFile(path, (e, data) => data));

const modifyCart = async (path, object, array) => fs.writeFile(path, JSON.stringify({
  subTotal: object.subTotal,
  dataDeEntrega: object.dataDeEntrega,
  valorDoFrete: object.valorDoFrete,
  totalAPagar: object.totalAPagar,
  produtos: array,
}, null, 2));

const resetCart = async (path) => fs.writeFile(path, JSON.stringify({
  subTotal: 0,
  dataDeEntrega: 0,
  valorDoFrete: 0,
  totalAPagar: 0,
  produtos: [],
}, null, 2));

// eslint-disable-next-line max-len
const readProducts = async (path) => JSON.parse(await fs.readFile(path, (e, data) => data)).produtos;

module.exports = {
  readCart, modifyCart, resetCart, readProducts,
};
