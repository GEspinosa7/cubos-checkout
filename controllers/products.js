const { readProducts } = require('../intermediary');

const listProducts = async (req, res) => {

   try {
      const products = await readProducts('./data/products.json');

      let { categoria, precoInicial, precoFinal } = req.query;

      if (categoria) {
         if (precoInicial || precoFinal) {
            let byPriceRangeAndCategorie;

            if (!precoInicial) {
               precoInicial = 0;
            }

            if (!precoFinal) {
               byPriceRangeAndCategorie = products.filter(p => p.preco >= precoInicial && p.categoria === categoria).filter(p => p.estoque > 0);
            } else {
               byPriceRangeAndCategorie = products.filter(p => p.preco >= precoInicial && p.preco <= precoFinal && p.categoria === categoria).filter(p => p.estoque > 0);
            }

            if (byPriceRangeAndCategorie.length === 0) {
               res.status(404);
               return res.json({
                  "mensagem": `Não há nenhum produto da categoria ${categoria} nessa faixa de preço em estoque`
               });
            }

            res.status(200);
            return res.json(byPriceRangeAndCategorie);
         }
         const byCategorie = products.filter(p => p.categoria === categoria).filter(p => p.estoque > 0);

         if (byCategorie.length === 0) {
            res.status(404);
            return res.json({
               "mensagem": `Não há nenhum produto da categoria ${categoria} em estoque`
            });
         }

         res.status(200);
         return res.json(byCategorie);
      }

      if (precoInicial || precoFinal) {
         let byPriceRange;

         if (!precoInicial) {
            precoInicial = 0;
         }

         if (!precoFinal) {
            byPriceRange = products.filter(p => p.preco >= precoInicial).filter(p => p.estoque > 0);
         } else {
            byPriceRange = products.filter(p => p.preco >= precoInicial && p.preco <= precoFinal).filter(p => p.estoque > 0);
         }

         if (byPriceRange.length === 0) {
            res.status(404);
            return res.json({
               "mensagem": `Não há nenhum produto nessa faixa de preco em estoque`
            });
         }

         res.status(200);
         return res.json(byPriceRange);
      }

      const available = products.filter(p => p.estoque > 0);

      if (available.length === 0) {
         res.status(404);
         return res.json({
            "mensagem": "Não há nenhum produto em estoque"
         });
      }

      res.status(200);
      res.json(available);

   } catch (e) {
      res.status(400);
      res.json({
         erro: `${e}`
      })
   }

}

module.exports = { listProducts };