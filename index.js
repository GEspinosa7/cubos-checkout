const express = require('express');
const swaggerUi = require('swagger-ui-express');
const router = require('./router');

const app = express();
app.use(express.json());

app.use(router);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('./swagger/swagger.json')));

app.listen(8000);
