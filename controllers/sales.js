const fs = require('fs').promises;

const listReportSales = async (req, res) => {

   try {
      const sales = JSON.parse(await fs.readFile('./data/sales.json', (e, data) => data)).vendas;

      if (sales.length === 0) {
         res.status(404);
         res.json({
            mensagem: "Nenhuma venda foi efeutada!"
         });
      }

      res.status(200);
      res.json(sales);

   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      });
   }
}

module.exports = { listReportSales };